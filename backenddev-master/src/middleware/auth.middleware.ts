import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { createError } from './error.middleware.js';
import { query } from '../db/postgres.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Alias for backward compatibility
export type AuthRequest = AuthenticatedRequest;

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createError('Authorization header missing', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw createError('Access token missing', 401);
    }

    // Verify the token
    const decoded = verifyAccessToken(token) as {
      userId: string;
      role: string;
    };

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

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired')) {
      throw createError('Invalid or expired access token', 401);
    }
    throw error;
  }
};

// Middleware to check if user has required role
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw createError('Insufficient permissions', 403);
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField] || req.query[resourceUserIdField];

    if (!resourceUserId || resourceUserId !== req.user.id) {
      throw createError('Access denied: You can only access your own resources', 403);
    }

    next();
  };
};

// Legacy alias for backward compatibility
export const authenticate = authenticateToken;