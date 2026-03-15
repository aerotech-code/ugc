import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string | number;
}

export const createError = (message: string, statusCode: number): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void _next;
  let error = { ...err } as CustomError;
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // PostgreSQL errors
  const errAny = err as unknown as { code?: string };
  const errCode = errAny.code;
  if (errCode) {
    if (errCode === '23505') {
      const message = 'Duplicate field value entered';
      error = createError(message, 400);
    } else if (errCode === '23503') {
      const message = 'Referenced resource not found';
      error = createError(message, 400);
    } else if (errCode === '23502') {
      const message = 'Required field is missing';
      error = createError(message, 400);
    } else if (errCode === '23514') {
      const message = 'Invalid data provided';
      error = createError(message, 400);
    } else if (errCode === 'ECONNREFUSED' || errCode === 'ENOTFOUND') {
      const message = 'Database connection failed';
      error = createError(message, 503);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = createError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = createError(message, 401);
  }

  // Validation errors (using Zod or similar)
  if (err.name === 'ZodError') {
    const message = 'Validation failed';
    error = createError(message, 400);
  }

  // Custom application errors
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  }

  // Default to 500 if no specific error code
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      code: (err as unknown as { code?: string }).code,
      details: err
    })
  } as ApiResponse);
};
