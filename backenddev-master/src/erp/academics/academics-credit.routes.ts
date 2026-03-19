import { Response, Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireAcademicsContext, AcademicsRequest } from './academics-context.middleware.js';
import { validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import CreditModel from './academics-credit.model.js';

const router = Router();

const ok = (res: Response, data?: unknown, extras: Record<string, unknown> = {}) => {
  res.status(200).json({ status: 'success', ...(data !== undefined ? { data } : {}), ...extras });
};

const created = (res: Response, data?: unknown) => {
  res.status(201).json({ status: 'success', ...(data !== undefined ? { data } : {}) });
};

const contextOf = (req: AcademicsRequest) => {
  if (!req.academicsContext) {
    throw createError('Academics context missing', 500);
  }
  return req.academicsContext;
};

// Apply auth + context middleware to all routes
router.use(authenticateToken, requireAcademicsContext);

// POST /  — Assign credits to a course
router.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.theory_credits, 'Theory credits');
  validateRequired(req.body.practical_credits, 'Practical credits');
  created(res, await CreditModel.create(contextOf(req), req.body, req.user!.id));
}));

// GET /  — Get all credits
router.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await CreditModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

// GET /:courseId  — Get credits by course
router.get('/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await CreditModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

// PUT /:id  — Update credits
router.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Credit ID');
  ok(res, await CreditModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Credits updated successfully',
  });
}));

export default router;
