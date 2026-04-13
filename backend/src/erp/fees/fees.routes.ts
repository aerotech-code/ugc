import { Response, Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';
import { asyncHandler, createError } from '../../middleware/error.middleware.js';
import { requireFeesContext, FeesRequest } from './fees-context.middleware.js';
import { validateEmail, validateEnum, validateRequired, validateUUID } from '../../middleware/validation.middleware.js';
import FeesModel from './fees.model.js';
import { buildReceiptPdf } from './fees-pdf.js';

const router = Router();

const ok = (res: Response, data?: unknown, extras: Record<string, unknown> = {}) => {
  res.status(200).json({ status: 'success', ...(data !== undefined ? { data } : {}), ...extras });
};

const created = (res: Response, data?: unknown) => {
  res.status(201).json({ status: 'success', ...(data !== undefined ? { data } : {}) });
};

const contextOf = (req: FeesRequest) => {
  if (!req.feesContext) {
    throw createError('Fees context missing', 500);
  }
  return req.feesContext;
};

router.use(authenticateToken, requireFeesContext);

router.get('/payroll', asyncHandler(async (req: FeesRequest, res: Response) => {
  const result = await FeesModel.listPayroll(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

router.get('/payroll/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Payroll ID');
  ok(res, await FeesModel.getPayroll(contextOf(req), String(req.params.id)));
}));

router.post('/payroll', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.body.employee_id), 'Employee ID');
  validateRequired(req.body.month, 'Month');
  validateRequired(req.body.gross_salary, 'Gross salary');
  created(res, await FeesModel.createPayroll(contextOf(req), req.body, req.user!.id));
}));

router.put('/payroll/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Payroll ID');
  await FeesModel.updatePayroll(contextOf(req), String(req.params.id), req.body, req.user!.id);
  ok(res, undefined, { message: 'Payroll record updated successfully' });
}));

router.delete('/payroll/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Payroll ID');
  await FeesModel.deletePayroll(contextOf(req), String(req.params.id), req.user!.id);
  ok(res, undefined, { message: 'Record deleted' });
}));

router.get('/scholarships', asyncHandler(async (req: FeesRequest, res: Response) => {
  ok(res, await FeesModel.listScholarships(contextOf(req), req.query));
}));

router.post('/scholarships', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateRequired(req.body.name, 'Name');
  validateEnum(String(req.body.category), ['merit', 'need-based', 'sports', 'govt'], 'category');
  validateEnum(String(req.body.discount_type), ['percentage', 'flat'], 'discount type');
  validateRequired(req.body.discount_value, 'Discount value');
  created(res, await FeesModel.createScholarship(contextOf(req), req.body, req.user!.id));
}));

router.put('/scholarships/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Scholarship ID');
  await FeesModel.updateScholarship(contextOf(req), String(req.params.id), req.body, req.user!.id);
  ok(res, undefined, { message: 'Scholarship updated' });
}));

router.delete('/scholarships/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Scholarship ID');
  await FeesModel.deactivateScholarship(contextOf(req), String(req.params.id), req.user!.id);
  ok(res, undefined, { message: 'Scholarship deactivated' });
}));

router.get('/fee-structure', asyncHandler(async (req: FeesRequest, res: Response) => {
  ok(res, await FeesModel.listFeeStructures(contextOf(req), req.query));
}));

router.post('/fee-structure', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.body.course_id), 'Course ID');
  validateRequired(req.body.components, 'Components');
  created(res, await FeesModel.createFeeStructure(contextOf(req), req.body, req.user!.id));
}));

router.put('/fee-structure/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Fee structure ID');
  await FeesModel.updateFeeStructure(contextOf(req), String(req.params.id), req.body, req.user!.id);
  ok(res, undefined, { message: 'Fee structure updated' });
}));

router.get('/fee-structure/:id/student/:studentId', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Fee structure ID');
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await FeesModel.getStudentFee(contextOf(req), String(req.params.id), String(req.params.studentId)));
}));

router.post('/pay', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.body.student_id), 'Student ID');
  validateUUID(String(req.body.fee_structure_id), 'Fee structure ID');
  validateRequired(req.body.amount, 'Amount');
  validateEnum(String(req.body.payment_mode), ['online', 'offline', 'cheque', 'dd'], 'payment mode');
  created(res, await FeesModel.processPayment(contextOf(req), req.body, req.user!.id));
}));

router.get('/pay', asyncHandler(async (req: FeesRequest, res: Response) => {
  res.status(200).json({ status: 'success', ...(await FeesModel.listPayments(contextOf(req), req.query)) });
}));

router.get('/pay/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Payment ID');
  ok(res, await FeesModel.getPayment(contextOf(req), String(req.params.id)));
}));

router.post('/pay/initiate', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.body.student_id), 'Student ID');
  validateRequired(req.body.amount, 'Amount');
  validateRequired(req.body.gateway, 'Gateway');
  ok(res, await FeesModel.initiatePayment(contextOf(req), req.body));
}));

router.post('/pay/webhook', asyncHandler(async (req: FeesRequest, res: Response) => {
  await FeesModel.handleWebhook(req.body);
  ok(res);
}));
router.get('/receipts', asyncHandler(async (req: FeesRequest, res: Response) => {
  ok(res, await FeesModel.listReceipts(contextOf(req), req.query));
}));

router.get('/receipts/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Receipt ID');
  ok(res, await FeesModel.getReceipt(contextOf(req), String(req.params.id)));
}));

router.get('/receipts/:id/pdf', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Receipt ID');
  const receipt = await FeesModel.getReceipt(contextOf(req), String(req.params.id));
  const pdf = buildReceiptPdf([
    `Receipt Number: ${String(receipt.receipt_number ?? '')}`,
    `Student ID: ${String(receipt.student_id ?? '')}`,
    `Student Name: ${String(receipt.student_name ?? '')}`,
    `Amount: ${String(receipt.amount ?? '')}`,
    `Payment Mode: ${String(receipt.payment_mode ?? '')}`,
    `Issued At: ${String(receipt.issued_at ?? '')}`,
  ]);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${String(receipt.receipt_number ?? 'receipt')}.pdf"`);
  res.status(200).send(pdf);
}));

router.post('/receipts/:id/email', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Receipt ID');
  validateEmail(String(req.body.email));
  await FeesModel.addReceiptHistory(String(req.params.id), 'emailed', req.user!.email, { email: req.body.email });
  ok(res, undefined, { message: 'Receipt emailed successfully' });
}));

router.post('/receipts/cancel/:id', requireRole(['admin']), asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Receipt ID');
  validateRequired(req.body.reason, 'Reason');
  validateUUID(String(req.body.cancelled_by), 'Cancelled by');
  ok(res, await FeesModel.cancelReceipt(contextOf(req), String(req.params.id), req.body), { message: 'Receipt cancelled' });
}));

router.get('/receipts/:id/history', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Receipt ID');
  ok(res, await FeesModel.getReceiptHistory(String(req.params.id)));
}));

router.get('/history/export', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateRequired(req.query.format, 'Format');
  validateEnum(String(req.query.format), ['csv', 'xlsx'], 'format');
  const csv = await FeesModel.exportHistory(contextOf(req), req.query);
  const extension = String(req.query.format) === 'xlsx' ? 'xlsx' : 'csv';
  const contentType = String(req.query.format) === 'xlsx'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'text/csv';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="fees-history.${extension}"`);
  res.status(200).send(csv);
}));

router.get('/history', asyncHandler(async (req: FeesRequest, res: Response) => {
  const result = await FeesModel.listHistory(contextOf(req), req.query);
  res.status(200).json({ status: 'success', ...result });
}));

router.get('/history/:studentId', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await FeesModel.getStudentHistory(contextOf(req), String(req.params.studentId), req.query.academic_year as string | undefined));
}));

router.get('/scholarship-awards', asyncHandler(async (req: FeesRequest, res: Response) => {
  ok(res, await FeesModel.listScholarshipAwards(contextOf(req), req.query));
}));

router.post('/scholarship-awards', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.body.student_id), 'Student ID');
  validateUUID(String(req.body.scholarship_id), 'Scholarship ID');
  created(res, await FeesModel.createScholarshipAward(contextOf(req), req.body));
}));

router.put('/scholarship-awards/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Award ID');
  await FeesModel.updateScholarshipAward(contextOf(req), String(req.params.id), req.body);
  ok(res, undefined, { message: 'Award updated' });
}));

router.get('/scholarship-awards/student/:studentId', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.studentId), 'Student ID');
  ok(res, await FeesModel.getScholarshipAwardsByStudent(contextOf(req), String(req.params.studentId)));
}));
router.get('/refunds', asyncHandler(async (req: FeesRequest, res: Response) => {
  ok(res, await FeesModel.listRefunds(contextOf(req), req.query));
}));

router.post('/refunds', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.body.student_id), 'Student ID');
  validateUUID(String(req.body.payment_id), 'Payment ID');
  validateRequired(req.body.amount, 'Amount');
  validateRequired(req.body.reason, 'Reason');
  created(res, await FeesModel.createRefund(contextOf(req), req.body));
}));

router.get('/refunds/:id', asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Refund ID');
  ok(res, await FeesModel.getRefund(contextOf(req), String(req.params.id)));
}));

router.put('/refunds/:id/approve', requireRole(['admin']), asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Refund ID');
  validateUUID(String(req.body.approved_by), 'Approved by');
  ok(res, await FeesModel.approveRefund(contextOf(req), String(req.params.id), req.body), { message: 'Refund approved' });
}));

router.put('/refunds/:id/reject', requireRole(['admin']), asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Refund ID');
  validateUUID(String(req.body.rejected_by), 'Rejected by');
  validateRequired(req.body.reason, 'Reason');
  await FeesModel.rejectRefund(contextOf(req), String(req.params.id), req.body);
  ok(res, undefined, { message: 'Refund rejected' });
}));

router.post('/refunds/:id/process', requireRole(['admin']), asyncHandler(async (req: FeesRequest, res: Response) => {
  validateUUID(String(req.params.id), 'Refund ID');
  validateUUID(String(req.body.processed_by), 'Processed by');
  validateRequired(req.body.transaction_ref, 'Transaction reference');
  validateRequired(req.body.processed_date, 'Processed date');
  ok(res, await FeesModel.processRefund(contextOf(req), String(req.params.id), req.body), { message: 'Refund processed' });
}));

export default router;
