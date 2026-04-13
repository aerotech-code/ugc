import { Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { requireAcademicsContext, AcademicsRequest } from '../erp/academics/academics-context.middleware.js';
import { validateRequired, validateUUID } from '../middleware/validation.middleware.js';

import CourseModel from '../erp/academics/academics-course.model.js';
import SyllabusModel from '../erp/academics/academics-syllabus.model.js';
import CreditModel from '../erp/academics/academics-credit.model.js';
import FeedbackModel from '../erp/academics/academics-feedback.model.js';
import TimetableModel from '../erp/academics/academics-timetable.model.js';
import AssignmentModel from '../erp/academics/academics-assignment.model.js';

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

// Apply auth + context middleware to ALL academics routes
router.use(authenticateToken, requireAcademicsContext);

// ==================== COURSES ====================
const courseRouter = Router();

courseRouter.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateRequired(req.body.code, 'Course code');
  validateRequired(req.body.name, 'Course name');
  created(res, await CourseModel.create(contextOf(req), req.body, req.user!.id));
}));

courseRouter.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await CourseModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

courseRouter.get('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Course ID');
  ok(res, await CourseModel.getById(contextOf(req), String(req.params.id)));
}));

courseRouter.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Course ID');
  ok(res, await CourseModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Course updated successfully',
  });
}));

courseRouter.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Course ID');
  await CourseModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Course deleted successfully' });
}));

// ==================== SYLLABUS ====================
const syllabusRouter = Router();

syllabusRouter.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.title, 'Syllabus title');
  created(res, await SyllabusModel.create(contextOf(req), req.body, req.user!.id));
}));

syllabusRouter.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await SyllabusModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

syllabusRouter.get('/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await SyllabusModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

syllabusRouter.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Syllabus ID');
  ok(res, await SyllabusModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Syllabus updated successfully',
  });
}));

syllabusRouter.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Syllabus ID');
  await SyllabusModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Syllabus deleted successfully' });
}));

// ==================== CREDITS ====================
const creditRouter = Router();

creditRouter.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.theory_credits, 'Theory credits');
  validateRequired(req.body.practical_credits, 'Practical credits');
  created(res, await CreditModel.create(contextOf(req), req.body, req.user!.id));
}));

creditRouter.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await CreditModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

creditRouter.get('/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await CreditModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

creditRouter.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Credit ID');
  ok(res, await CreditModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Credits updated successfully',
  });
}));

// ==================== FEEDBACK ====================
const feedbackRouter = Router();

feedbackRouter.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  created(res, await FeedbackModel.create(contextOf(req), req.body, req.user!.id));
}));

feedbackRouter.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await FeedbackModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

feedbackRouter.get('/course/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await FeedbackModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

feedbackRouter.get('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Feedback ID');
  ok(res, await FeedbackModel.getById(contextOf(req), String(req.params.id)));
}));

feedbackRouter.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Feedback ID');
  await FeedbackModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Feedback deleted successfully' });
}));

// ==================== TIMETABLE ====================
const timetableRouter = Router();

timetableRouter.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateRequired(req.body.name, 'Timetable name');
  created(res, await TimetableModel.create(contextOf(req), req.body, req.user!.id));
}));

timetableRouter.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await TimetableModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

timetableRouter.get('/semester/:semesterId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.semesterId), 'Semester ID');
  ok(res, await TimetableModel.getBySemester(contextOf(req), String(req.params.semesterId)));
}));

timetableRouter.get('/department/:deptId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.deptId), 'Department ID');
  ok(res, await TimetableModel.getByDepartment(contextOf(req), String(req.params.deptId)));
}));

timetableRouter.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Timetable ID');
  ok(res, await TimetableModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Timetable updated successfully',
  });
}));

timetableRouter.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Timetable ID');
  await TimetableModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Timetable deleted successfully' });
}));

// ==================== ASSIGNMENTS ====================
const assignmentRouter = Router();

assignmentRouter.post('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.title, 'Assignment title');
  created(res, await AssignmentModel.create(contextOf(req), req.body, req.user!.id));
}));

assignmentRouter.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  const result = await AssignmentModel.list(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

assignmentRouter.get('/course/:courseId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.courseId), 'Course ID');
  ok(res, await AssignmentModel.getByCourse(contextOf(req), String(req.params.courseId)));
}));

assignmentRouter.post('/:id/submit', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Assignment ID');
  created(res, await AssignmentModel.submit(contextOf(req), String(req.params.id), req.user!.id, req.body));
}));

assignmentRouter.get('/:id/submissions', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Assignment ID');
  const result = await AssignmentModel.getSubmissions(contextOf(req), String(req.params.id), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

assignmentRouter.get('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Assignment ID');
  ok(res, await AssignmentModel.getById(contextOf(req), String(req.params.id)));
}));

assignmentRouter.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Assignment ID');
  ok(res, await AssignmentModel.update(contextOf(req), String(req.params.id), req.body, req.user!.id), {
    message: 'Assignment updated successfully',
  });
}));

assignmentRouter.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Assignment ID');
  await AssignmentModel.delete(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Assignment deleted successfully' });
}));

// ==================== MOUNT ROUTERS ====================
router.use('/curriculum/courses', courseRouter);
router.use('/curriculum/syllabus', syllabusRouter);
router.use('/curriculum/credits', creditRouter);
router.use('/feedback', feedbackRouter);
router.use('/timetable', timetableRouter);
router.use('/assignments', assignmentRouter);

export default router;
