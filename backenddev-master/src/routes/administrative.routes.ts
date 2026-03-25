import { Router } from 'express';
import staffRecordsRoutes from '../erp/administrative/staff-records/staff-records.routes.js';
import leaveRecordsRoutes from '../erp/administrative/leave-records/leave-records.routes.js';

const router = Router();

router.use('/staff-records', staffRecordsRoutes);
router.use('/leave-records', leaveRecordsRoutes);

export default router;
