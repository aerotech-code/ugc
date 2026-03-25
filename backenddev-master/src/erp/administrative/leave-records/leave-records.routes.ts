import { Response, Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import { validateRequired, validateUUID } from '../../../middleware/validation.middleware.js';
import LeaveModel from './leave-records.model.js';
import { ok, created } from '../../academics/core/academics.utils.js';

const router = Router();

router.post('/', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.body.staff_id), 'Staff ID');
  validateRequired(req.body.leave_type, 'Leave Type');
  validateRequired(req.body.start_date, 'Start Date');
  validateRequired(req.body.end_date, 'End Date');
  validateRequired(req.body.reason, 'Reason');

  created(res, await LeaveModel.submitLeaveRequest(req.body));
}));

router.get('/', asyncHandler(async (req, res: Response) => {
  ok(res, await LeaveModel.listLeaveRecords());
}));

router.get('/:id', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.params.id), 'Leave Record ID');
  ok(res, await LeaveModel.getLeaveRecord(String(req.params.id)));
}));

router.put('/:id', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.params.id), 'Leave Record ID');
  validateRequired(req.body.status, 'Status');
  ok(res, await LeaveModel.updateLeaveStatus(String(req.params.id), req.body.status));
}));

router.delete('/:id', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.params.id), 'Leave Record ID');
  ok(res, await LeaveModel.cancelLeaveRequest(String(req.params.id)));
}));

export default router;
