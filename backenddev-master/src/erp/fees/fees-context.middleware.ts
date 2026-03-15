import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { createError } from '../../middleware/error.middleware.js';
import { validateUUID } from '../../middleware/validation.middleware.js';

export interface FeesContext {
  institutionId: string;
  academicYear: string;
}

export interface FeesRequest extends AuthenticatedRequest {
  feesContext?: FeesContext;
}

export const requireFeesContext = (req: FeesRequest, _res: Response, next: NextFunction): void => {
  const institutionId = req.header('X-Institution-ID');
  const academicYear = req.header('X-Academic-Year');

  if (!institutionId) {
    throw createError('X-Institution-ID header is required', 400);
  }

  validateUUID(institutionId, 'X-Institution-ID');

  if (!academicYear || academicYear.trim().length === 0) {
    throw createError('X-Academic-Year header is required', 400);
  }

  req.feesContext = {
    institutionId,
    academicYear: academicYear.trim(),
  };

  next();
};
