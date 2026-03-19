import { Response, Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireAcademicsContext, AcademicsRequest } from './academics-context.middleware.js';
import { validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import FeedbackModel from './academics-feedback.model.js';

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

// POST /  — Submit feedback
router.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  created(res, await FeedbackModel.create(contextOf(req), req.body, req.user!.id));
}));

// GET /  — Get all feedback
router.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await FeedbackModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

// GET /course/:courseId  — Get feedback by course (placed before /:id to avoid conflict)
router.get('/course/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await FeedbackModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

// GET /:id  — Get feedback by ID
router.get('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Feedback ID');
  ok(res, await FeedbackModel.getById(contextOf(req), String(req.params.id)));
}));

// DELETE /:id  — Delete feedback
router.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Feedback ID');
  await FeedbackModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Feedback deleted successfully' });
}));

export default router;
