import { Request, Response, NextFunction } from 'express';
import { createError } from './error.middleware.js';

// Email validation regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (at least 6 characters)
export const validatePassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

// UUID validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Common validation functions
export const validateRequired = (value: unknown, fieldName: string): void => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    throw createError(`${fieldName} is required`, 400);
  }
};

export const validateEmail = (email: string): void => {
  if (!emailRegex.test(email)) {
    throw createError('Invalid email format', 400);
  }
};

export const validateEnum = (value: string, allowedValues: string[], fieldName: string): void => {
  if (!allowedValues.includes(value)) {
    throw createError(`Invalid ${fieldName}: ${value}. Allowed values: ${allowedValues.join(', ')}`, 400);
  }
};

export const validateUUID = (uuid: string, fieldName: string): void => {
  if (!isValidUUID(uuid)) {
    throw createError(`Invalid ${fieldName} format`, 400);
  }
};

export const validatePagination = (page: string, limit: string): { pageNum: number; limitNum: number } => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw createError('Page must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw createError('Limit must be between 1 and 100', 400);
  }

  return { pageNum, limitNum };
};

// Middleware for validating request body
export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const field of requiredFields) {
      if (!(field in req.body) || req.body[field] === undefined || req.body[field] === null) {
        throw createError(`${field} is required`, 400);
      }
    }
    next();
  };
};

// Middleware for validating query parameters
export const validateQueryParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const param of requiredParams) {
      if (!(param in req.query) || !req.query[param]) {
        throw createError(`${param} query parameter is required`, 400);
      }
    }
    next();
  };
};