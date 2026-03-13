import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { query } from '../../db/postgres.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { validateRequired, validateEmail, validatePassword } from '../../middleware/validation.middleware.js';
import { ApiResponse, User } from '../../types/index.js';

const router = Router();

console.log("✅ Auth routes file loaded");

// Login route
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateRequired(email, 'Email');
  validateRequired(password, 'Password');
  validateEmail(email);

  // Find user by email
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw createError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw createError('Account is deactivated', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign(payload, jwtSecret, { expiresIn } as any);

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
        },
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    }
  } as ApiResponse<{ user: User; token: string }>);
}));

// Register route (if needed, but we have it in user routes)
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
  if (!validRoles.includes(role)) {
    throw createError('Invalid role specified', 400);
  }

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
     RETURNING *`,
    [email, passwordHash, role, firstName, lastName]
  );

  const user = result.rows[0];

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign(payload, jwtSecret, { expiresIn } as any);

  res.status(201).json({
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
        },
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    }
  } as ApiResponse<{ user: User; token: string }>);
}));

// Verify token route
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw createError('Authorization header missing', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw createError('Access token missing', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  // Verify the token
  const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string; role: string };

  // Check if user still exists and is active
  const userResult = await query(
    'SELECT id, email, role, is_active FROM users WHERE id = $1',
    [decoded.userId]
  );

  if (userResult.rows.length === 0) {
    throw createError('User not found', 401);
  }

  const user = userResult.rows[0];
  if (!user.is_active) {
    throw createError('Account is deactivated', 401);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  } as ApiResponse<{ user: { id: string; email: string; role: string } }>);
}));

// Redis test route (keep for debugging)
router.get('/redis-test', asyncHandler(async (req, res) => {
  const { redis, isRedisConnected } = await import('../../db/redis.js');

  try {
    const connected = await isRedisConnected();
    if (!connected) {
      throw createError('Redis not available', 503);
    }
    await redis.set('test', 'working');
    const value = await redis.get('test');
    res.json({
      success: true,
      data: { value }
    } as ApiResponse<{ value: string }>);
  } catch {
    throw createError('Redis operation failed', 500);
  }
}));

export default router;
