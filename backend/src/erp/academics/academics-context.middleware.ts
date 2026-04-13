import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { createError } from '../../middleware/error.middleware.js';
import { validateUUID } from '../../middleware/validation.middleware.js';

export interface AcademicsContext {
  institutionId: string;
}

export interface AcademicsRequest extends AuthenticatedRequest {
  academicsContext?: AcademicsContext;
}

export const requireAcademicsContext = (req: AcademicsRequest, _res: Response, next: NextFunction): void => {
  const institutionId = req.header('X-Institution-ID');

  if (!institutionId) {
    throw createError('X-Institution-ID header is required', 400);
  }

  validateUUID(institutionId, 'X-Institution-ID');

  req.academicsContext = {
    institutionId,
  };

  next();
};
