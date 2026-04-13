import { Response, Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireAcademicsContext, AcademicsRequest } from './academics-context.middleware.js';
import { validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import CourseModel from './academics-course.model.js';

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

// POST /  — Create a course
router.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateRequired(req.body.code, 'Course code');
  validateRequired(req.body.name, 'Course name');
  created(res, await CourseModel.create(contextOf(req), req.body, req.user!.id));
}));

// GET /  — List all courses
router.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await CourseModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

// GET /:id  — Get course by ID
router.get('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Course ID');
  ok(res, await CourseModel.getById(contextOf(req), String(req.params.id)));
}));

// PUT /:id  — Update course
router.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Course ID');
  ok(res, await CourseModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Course updated successfully',
  });
}));

// DELETE /:id  — Delete course
router.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Course ID');
  await CourseModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Course deleted successfully' });
}));

export default router;
