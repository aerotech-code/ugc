import { Response, Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import { validateRequired, validateUUID } from '../../../middleware/validation.middleware.js';
import StaffModel from './staff-records.model.js';
import { ok, created } from '../../academics/core/academics.utils.js';

const router = Router();

router.post('/', asyncHandler(async (req, res: Response) => {
  validateRequired(req.body.name, 'Name');
  validateRequired(req.body.email, 'Email');
  validateRequired(req.body.role, 'Role');
  validateRequired(req.body.department, 'Department');
  validateRequired(req.body.joining_date, 'Joining Date');

  created(res, await StaffModel.createStaffRecord(req.body));
}));

router.get('/', asyncHandler(async (req, res: Response) => {
  ok(res, await StaffModel.listStaffRecords());
}));

router.get('/:id', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.params.id), 'Staff ID');
  ok(res, await StaffModel.getStaffRecord(String(req.params.id)));
}));

router.put('/:id', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.params.id), 'Staff ID');
  ok(res, await StaffModel.updateStaffRecord(String(req.params.id), req.body));
}));

router.delete('/:id', asyncHandler(async (req, res: Response) => {
  validateUUID(String(req.params.id), 'Staff ID');
  ok(res, await StaffModel.deleteStaffRecord(String(req.params.id)));
}));

export default router;
