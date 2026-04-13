import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth.middleware.js';
import { requireAcademicsContext } from './academics-context.middleware.js';

import semesterRoutes from '../semester/semester.routes.js';
import examRoutes from '../exam/exam.routes.js';
import healthDashboardRoutes from '../health-dashboard/health-dashboard.routes.js';

const router = Router();

// Apply global middlewares
router.use(authenticateToken, requireAcademicsContext);

// Mount the modularized routes
router.use('/semester', semesterRoutes);
router.use('/exam', examRoutes);
router.use('/', healthDashboardRoutes);

export default router;
