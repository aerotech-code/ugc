import { Response, Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireAdmissionContext, AdmissionRequest } from './admission-context.middleware.js';
import { validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import AdmissionDocumentModel from './admission-document.model.js';

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

// POST /upload  — Upload supporting documents
router.post('/upload', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateRequired(req.body.applicationId, 'Application ID');
  validateRequired(req.body.documentType, 'Document Type');
  validateRequired(req.body.fileUrl, 'File URL');
  validateUUID(String(req.body.applicationId), 'Application ID');
  created(res, await AdmissionDocumentModel.upload(contextOf(req), req.body, req.user!.id));
}));

// GET /:appId  — Retrieve documents for an application
router.get('/:appId', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.appId), 'Application ID');
  const result = await AdmissionDocumentModel.getByAppId(contextOf(req), String(req.params.appId));
  res.status(200).json({ status: 'success', ...result });
}));

// GET /:docId/status  — Get verification status of a document
router.get('/:docId/status', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.docId), 'Document ID');
  ok(res, await AdmissionDocumentModel.getStatus(contextOf(req), String(req.params.docId)));
}));

// PUT /:docId/verify  — Mark a document as verified
router.put('/:docId/verify', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.docId), 'Document ID');
  ok(res, await AdmissionDocumentModel.verify(contextOf(req), String(req.params.docId), req.user!.id), {
    message: 'Document verified successfully',
  });
}));

// PUT /:docId/reject  — Reject a document with reason
router.put('/:docId/reject', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.docId), 'Document ID');
  validateRequired(req.body.reason, 'Reason');
  ok(res, await AdmissionDocumentModel.reject(contextOf(req), String(req.params.docId), req.body.reason, req.user!.id), {
    message: 'Document rejected',
  });
}));

// DELETE /:docId  — Delete an uploaded document
router.delete('/:docId', asyncHandler(async (req: AdmissionRequest, res: Response) => {
  validateUUID(String(req.params.docId), 'Document ID');
  await AdmissionDocumentModel.delete(contextOf(req), String(req.params.docId));
  ok(res, undefined, { message: 'Document deleted successfully' });
}));

export default router;
