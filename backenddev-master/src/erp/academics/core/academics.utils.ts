import { Response } from 'express';
import { AcademicsRequest } from './academics-context.middleware.js';
import { createError } from '../../../middleware/error.middleware.js';

export const ok = (res: Response, data?: unknown, extras: Record<string, unknown> = {}) => {
  res.status(200).json({ status: 'success', ...(data !== undefined ? { data } : {}), ...extras });
};

export const created = (res: Response, data?: unknown) => {
  res.status(201).json({ status: 'success', ...(data !== undefined ? { data } : {}) });
};

export const contextOf = (req: AcademicsRequest) => {
  if (!req.academicsContext) {
    throw createError('Academics context missing', 500);
  }
  return req.academicsContext;
};
