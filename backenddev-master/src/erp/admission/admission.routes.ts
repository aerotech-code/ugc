import { Router } from 'express';
import applicationRoutes from './admission-application.routes.js';
import documentRoutes from './admission-document.routes.js';
import testRoutes from './admission-test.routes.js';

const router = Router();

router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);
router.use('/entrance-test', testRoutes);

export default router;
