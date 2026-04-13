import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { createError } from '../../middleware/error.middleware.js';
import { validateUUID } from '../../middleware/validation.middleware.js';

export interface AdmissionContext {
  institutionId: string;
}

export interface AdmissionRequest extends AuthenticatedRequest {
  admissionContext?: AdmissionContext;
}

export const requireAdmissionContext = (req: AdmissionRequest, _res: Response, next: NextFunction): void => {
  const institutionId = req.header('X-Institution-ID');

  if (!institutionId) {
    throw createError('X-Institution-ID header is required', 400);
  }

  validateUUID(institutionId, 'X-Institution-ID');

  req.admissionContext = {
    institutionId,
  };

  next();
};
