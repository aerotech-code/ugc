import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/postgres.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authenticateToken, requireOwnershipOrAdmin, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validateRequired, validateEmail, validateEnum, validatePassword, isValidUUID } from '../middleware/validation.middleware.js';
import { ApiResponse, User } from '../types/index.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const router = Router();

// Register user
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role = 'applicant' } = req.body;

  validateRequired(email, 'Email');
  validateRequired(password, 'Password');
  validateRequired(firstName, 'First name');
  validateRequired(lastName, 'Last name');

  validateEmail(email);
  validatePassword(password);

  // Validate role
  const validRoles = ['applicant', 'reviewer', 'admin'];
  validateEnum(role, validRoles, 'role');

  // Check if user exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw createError('User already exists', 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const result = await query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role, first_name, last_name, created_at`,
    [email, passwordHash, role, firstName, lastName]
  );

  const user = result.rows[0];

  // Generate JWT using utility functions
  const token = generateAccessToken({ userId: user.id, role: user.role });

  res.status(201).json({
    success: true,
    data: { user, token }
  } as ApiResponse);
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError('Invalid email format', 400);
  }

  // Find user
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw createError('Invalid credentials', 401);
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw createError('Account is deactivated', 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw createError('Invalid credentials', 401);
  }

  // Generate JWT using utility functions
  const token = generateAccessToken({ userId: user.id, role: user.role });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.avatar,
          department: user.department,
          position: user.position
        }
      },
      token
    }
  } as ApiResponse);
}));

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.query.userId as string;

  validateRequired(userId, 'User ID');
  if (!isValidUUID(userId)) {
    throw createError('Invalid User ID format', 400);
  }

  // Check ownership or admin access
  if (req.user!.role !== 'admin' && req.user!.id !== userId) {
    throw createError('Access denied: You can only view your own profile', 403);
  }

  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw createError('User not found', 404);
  }

  const user = result.rows[0];

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        department: user.department,
        position: user.position
      },
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  } as ApiResponse<User>);
}));

// Update user profile
router.patch('/profile', authenticateToken, requireOwnershipOrAdmin('userId'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.body.userId;
  const { firstName, lastName, department, position } = req.body;

  validateRequired(userId, 'User ID');
  if (!isValidUUID(userId)) {
    throw createError('Invalid User ID format', 400);
  }

  // Validate input
  if (firstName !== undefined && (!firstName || firstName.trim().length === 0)) {
    throw createError('First name cannot be empty', 400);
  }
  if (lastName !== undefined && (!lastName || lastName.trim().length === 0)) {
    throw createError('Last name cannot be empty', 400);
  }

  const result = await query(
    `UPDATE users
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         department = COALESCE($3, department),
         position = COALESCE($4, position),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [firstName, lastName, department, position, userId]
  );

  if (result.rows.length === 0) {
    throw createError('User not found', 404);
  }

  const user = result.rows[0];

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        department: user.department,
        position: user.position
      }
    }
  } as ApiResponse<User>);
}));

export default router;