import { Response, Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireAdmissionContext, AdmissionRequest } from './admission-context.middleware.js';
import { validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import AdmissionTestModel from './admission-test.model.js';

const router = Router();

const ok = (res: Response, data?: unknown, extras: Record<string, unknown> = {}) => {
  res.status(200).json({ status: 'success', ...(data !== undefined ? { data } : {}), ...extras });
};

const created = (res: Response, data?: unknown) => {
  res.status(201).json({ status: 'success', ...(data !== undefined ? { data } : {}) });
};

const contextOf = (req: AdmissionRequest) => {
  if (!req.admissionContext) {
    throw createError('Admission context missing', 500);
  }
  return req.admissionContext;
};

// Apply auth + context middleware to all routes
router.use(authenticateToken, requireAdmissionContext);

// POST /schedule  — Schedule an entrance test
router.post('/schedule', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateRequired(req.body.testName, 'Test Name');
  validateRequired(req.body.testDate, 'Test Date');
  created(res, await AdmissionTestModel.schedule(contextOf(req), req.body, req.user!.id));
}));

// GET /schedule  — Get all scheduled test slots
router.get('/schedule', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  const result = await AdmissionTestModel.getSchedule(contextOf(req));
  res.status(200).json({ status: 'success', ...result });
}));

// POST /register  — Register applicant for entrance test
router.post('/register', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateRequired(req.body.applicationId, 'Application ID');
  validateRequired(req.body.testId, 'Test ID');
  validateUUID(String(req.body.applicationId), 'Application ID');
  validateUUID(String(req.body.testId), 'Test ID');
  created(res, await AdmissionTestModel.register(contextOf(req), req.body));
}));

// GET /:appId/admit-card  — Download admit card
router.get('/:appId/admit-card', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.appId), 'Application ID');
  ok(res, await AdmissionTestModel.getAdmitCard(contextOf(req), String(req.params.appId)));
}));

// POST /results  — Upload / submit test results
router.post('/results', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateRequired(req.body.applicationId, 'Application ID');
  validateRequired(req.body.testId, 'Test ID');
  validateRequired(req.body.score, 'Score');
  validateUUID(String(req.body.applicationId), 'Application ID');
  validateUUID(String(req.body.testId), 'Test ID');
  ok(res, await AdmissionTestModel.uploadResults(contextOf(req), req.body), { message: 'Results uploaded successfully' });
}));

// GET /:appId/score  — Get applicant's test score
router.get('/:appId/score', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.appId), 'Application ID');
  const result = await AdmissionTestModel.getScore(contextOf(req), String(req.params.appId));
  res.status(200).json({ status: 'success', ...result });
}));

export default router;
