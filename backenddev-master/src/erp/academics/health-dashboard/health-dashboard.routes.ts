import { Response, Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import { AcademicsRequest } from '../core/academics-context.middleware.js';
import HealthDashboardModel from './health-dashboard.model.js';
import { ok, contextOf } from '../core/academics.utils.js';

const router = Router();

router.get('/dashboard', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  ok(res, await HealthDashboardModel.getDashboardStats(contextOf(req)));
}));

router.get('/health', asyncHandler(async (req: AcademicsRequest, res: Response) => {
  res.status(200).json({ status: 'success', data: { status: 'OK', context: contextOf(req) } });
}));

export default router;
