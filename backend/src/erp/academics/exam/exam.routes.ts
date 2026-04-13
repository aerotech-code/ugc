import { Response, Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import { AcademicsRequest } from '../core/academics-context.middleware.js';
import { validateRequired, validateUUID } from '../../../middleware/validation.middleware.js';
import ExamModel from './exam.model.js';
import { ok, created, contextOf } from '../core/academics.utils.js';

const router = Router();

// ==========================================
// Exam Internal APIs
// ==========================================

router.post('/internal', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.semester_id), 'Semester ID');
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.name, 'Name');
  validateRequired(req.body.max_marks, 'Max marks');
  validateRequired(req.body.passing_marks, 'Passing marks');
  created(res, await ExamModel.createInternalExam(contextOf(req), req.body, req.user!.id));
}));

router.get('/internal', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await ExamModel.listInternalExams(contextOf(req)));
}));

router.get('/internal/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Exam ID');
  ok(res, await ExamModel.getInternalExam(contextOf(req), String(req.params.id)));
}));

router.put('/internal/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Exam ID');
  ok(res, await ExamModel.updateInternalExam(contextOf(req), String(req.params.id), req.body, req.user!.id));
}));

router.post('/internal/:id/marks', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Exam ID');
  validateUUID(String(req.body.student_id), 'Student ID');
  validateRequired(req.body.marks, 'Marks');
  created(res, await ExamModel.enterInternalMarks(contextOf(req), String(req.params.id), req.body, req.user!.id));
}));

// ==========================================
// Exam Final APIs
// ==========================================

router.post('/final', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.semester_id), 'Semester ID');
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.name, 'Name');
  validateRequired(req.body.max_marks, 'Max marks');
  validateRequired(req.body.passing_marks, 'Passing marks');
  created(res, await ExamModel.createFinalExam(contextOf(req), req.body, req.user!.id));
}));

router.get('/final', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await ExamModel.listFinalExams(contextOf(req)));
}));

router.get('/final/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Exam ID');
  ok(res, await ExamModel.getFinalExam(contextOf(req), String(req.params.id)));
}));

router.put('/final/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Exam ID');
  ok(res, await ExamModel.updateFinalExam(contextOf(req), String(req.params.id), req.body, req.user!.id));
}));

router.post('/final/:id/marks', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Exam ID');
  validateUUID(String(req.body.student_id), 'Student ID');
  validateRequired(req.body.marks, 'Marks');
  created(res, await ExamModel.enterFinalMarks(contextOf(req), String(req.params.id), req.body, req.user!.id));
}));

// ==========================================
// Exam Results APIs
// ==========================================

router.post('/results/process', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.semester_id), 'Semester ID');
  validateUUID(String(req.body.student_id), 'Student ID');
  created(res, await ExamModel.processResults(contextOf(req), req.body));
}));

router.get('/results', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await ExamModel.listResults(contextOf(req)));
}));

router.get('/results/student/:studentId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await ExamModel.getStudentResults(contextOf(req), String(req.params.studentId)));
}));

router.get('/results/semester/:semId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.semId), 'Semester ID');
  ok(res, await ExamModel.getSemesterResults(contextOf(req), String(req.params.semId)));
}));

router.patch('/results/:id/publish', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Result ID');
  ok(res, await ExamModel.publishResult(contextOf(req), String(req.params.id), req.body));
}));

// ==========================================
// Exam Transcription APIs
// ==========================================

router.post('/transcription/request', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.student_id), 'Student ID');
  created(res, await ExamModel.requestTranscription(contextOf(req), req.body));
}));

router.get('/transcription', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await ExamModel.listTranscriptions(contextOf(req)));
}));

router.get('/transcription/student/:studentId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await ExamModel.getStudentTranscriptions(contextOf(req), String(req.params.studentId)));
}));

router.patch('/transcription/:id/approve', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Transcription ID');
  ok(res, await ExamModel.approveTranscription(contextOf(req), String(req.params.id), req.user!.id));
}));

// ==========================================
// Exam Back APIs
// ==========================================

router.post('/back', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.body.semester_id), 'Semester ID');
  validateUUID(String(req.body.student_id), 'Student ID');
  validateUUID(String(req.body.course_id), 'Course ID');
  created(res, await ExamModel.registerBackExam(contextOf(req), req.body));
}));

router.get('/back', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await ExamModel.listBackExams(contextOf(req)));
}));

router.get('/back/student/:studentId', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await ExamModel.getStudentBackExams(contextOf(req), String(req.params.studentId)));
}));

router.put('/back/:id', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Back Exam ID');
  validateRequired(req.body.status, 'Status');
  ok(res, await ExamModel.updateBackExamStatus(contextOf(req), String(req.params.id), req.body));
}));

router.post('/back/:id/marks', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Back Exam ID');
  validateRequired(req.body.marks, 'Marks');
  created(res, await ExamModel.enterBackExamMarks(contextOf(req), String(req.params.id), req.body, req.user!.id));
}));

export default router;
