import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validateRequired, validateUUID } from '../middleware/validation.middleware.js';
import { EnrollmentModel } from '../erp/admission/enrollment/enrollment.model.js';
import { ApiError } from '../utils/apiError.js';

const router = Router();

router.use(authenticateToken);

// ===================== ENROLLMENT CONFIRMATION =====================

/**
 * POST /api/admissions/enrollment/confirm
 * Confirm enrollment & submit fee proof
 */
router.post('/enrollment/confirm', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { app_id, student_name, course, academic_year, fee_amount, fee_proof_url, payment_reference } = req.body;

  validateRequired(app_id, 'Application ID');
  validateUUID(app_id, 'Application ID');
  validateRequired(student_name, 'Student Name');
  validateRequired(course, 'Course');
  validateRequired(academic_year, 'Academic Year');
  validateRequired(fee_amount, 'Fee Amount');

  if (isNaN(Number(fee_amount)) || Number(fee_amount) <= 0) {
    throw new ApiError(400, 'fee_amount must be a positive number');
  }

  const enrollment = await EnrollmentModel.confirmEnrollment({
    app_id,
    student_name,
    course,
    academic_year,
    fee_amount: Number(fee_amount),
    fee_proof_url,
    payment_reference,
  });

  res.status(201).json({
    success: true,
    message: 'Enrollment confirmed successfully',
    data: enrollment,
  });
}));

/**
 * POST /api/admissions/enrollment/fees/pay
 * Initiate fee payment
 */
router.post('/enrollment/fees/pay', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { app_id, payment_gateway_txn_id, payment_mode } = req.body;

  validateRequired(app_id, 'Application ID');
  validateUUID(app_id, 'Application ID');
  validateRequired(payment_gateway_txn_id, 'Payment Gateway Transaction ID');

  const result = await EnrollmentModel.initiateFeesPayment({
    app_id,
    payment_gateway_txn_id,
    payment_mode,
  });

  res.status(200).json({
    success: true,
    message: 'Fee payment recorded successfully',
    data: result,
  });
}));

/**
 * GET /api/admissions/enrollment/:appId
 * Get enrollment details
 */
router.get('/enrollment/:appId', asyncHandler(async (req: Request, res: Response) => {
  const { appId } = req.params as { appId: string };
  validateUUID(appId, 'Application ID');

  const enrollment = await EnrollmentModel.getEnrollmentByAppId(appId);

  res.status(200).json({
    success: true,
    data: enrollment,
  });
}));

/**
 * PUT /api/admissions/enrollment/:appId/approve
 * Admin approves enrollment
 */
router.put('/enrollment/:appId/approve', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { appId } = req.params as { appId: string };
  validateUUID(appId, 'Application ID');

  const approvedBy = req.user?.id;
  if (!approvedBy) {
    throw new ApiError(401, 'Authenticated user required to approve enrollment');
  }

  const enrollment = await EnrollmentModel.approveEnrollment(appId, approvedBy);

  res.status(200).json({
    success: true,
    message: 'Enrollment approved successfully',
    data: enrollment,
  });
}));

/**
 * GET /api/admissions/enrollment/:appId/receipt
 * Download fee payment receipt
 */
router.get('/enrollment/:appId/receipt', asyncHandler(async (req: Request, res: Response) => {
  const { appId } = req.params as { appId: string };
  validateUUID(appId, 'Application ID');

  const receipt = await EnrollmentModel.getFeeReceipt(appId);

  res.status(200).json({
    success: true,
    message: 'Fee payment receipt retrieved successfully',
    data: receipt,
  });
}));

/**
 * GET /api/admissions/enrollment/:appId/id-card
 * Download enrollment ID card
 */
router.get('/enrollment/:appId/id-card', asyncHandler(async (req: Request, res: Response) => {
  const { appId } = req.params as { appId: string };
  validateUUID(appId, 'Application ID');

  const idCard = await EnrollmentModel.getIdCard(appId);

  res.status(200).json({
    success: true,
    message: 'Enrollment ID card data retrieved successfully',
    data: idCard,
  });
}));

export default router;
