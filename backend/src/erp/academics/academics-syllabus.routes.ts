import { Response, Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireAcademicsContext, AcademicsRequest } from './academics-context.middleware.js';
import { validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import SyllabusModel from './academics-syllabus.model.js';


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

// POST /  — Create syllabus
router.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.title, 'Syllabus title');
  created(res, await SyllabusModel.create(contextOf(req), req.body, req.user!.id));
}));

// GET /  — List all syllabi
router.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await SyllabusModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

// GET /:courseId  — Get syllabus by course
router.get('/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await SyllabusModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

// PUT /:id  — Update syllabus
router.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Syllabus ID');
  ok(res, await SyllabusModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Syllabus updated successfully',
  });
}));

// DELETE /:id  — Delete syllabus
router.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Syllabus ID');
  await SyllabusModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Syllabus deleted successfully' });
}));

export default router;
