import { Response, Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import { AcademicsRequest } from '../core/academics-context.middleware.js';
import { validateRequired, validateUUID } from '../../../middleware/validation.middleware.js';
import SemesterModel from './semester.model.js';
import { ok, created, contextOf } from '../core/academics.utils.js';

const router = Router();

router.post('/register', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateRequired(req.body.name, 'Name');
  created(res, await SemesterModel.registerSemester(contextOf(req), req.body, req.user!.id));
}));

router.get('/', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await SemesterModel.listSemesters(contextOf(req)));
}));

router.get('/student/:studentId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await SemesterModel.getStudentSemesterRegistrations(contextOf(req), String(req.params.studentId)));
}));

router.get('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Semester ID');
  ok(res, await SemesterModel.getSemester(contextOf(req), String(req.params.id)));
}));


router.put('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Semester ID');
  ok(res, await SemesterModel.updateSemester(contextOf(req), String(req.params.id), req.body, req.user!.id));
}));

router.patch('/:id/status', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Semester ID');
  validateRequired(req.body.status, 'Status');
  await SemesterModel.toggleSemesterStatus(contextOf(req), String(req.params.id), req.body.status, req.user!.id);
  ok(res, undefined, { message: 'Semester status updated' });
}));

router.delete('/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Semester ID');
  await SemesterModel.deleteSemester(contextOf(req), String(req.params.id));
  ok(res, undefined, { message: 'Semester deleted' });
}));

export default router;
