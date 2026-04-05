import { Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import MeritController from './merit-result.controller.js';

const router = Router();

router.post('/generate', asyncHandler(MeritController.generateMeritList));
router.get('/list', asyncHandler(MeritController.listMeritList));
router.get('/:appId/rank', asyncHandler(MeritController.getRank));
router.put('/publish', asyncHandler(MeritController.publish));
router.get('/cutoff', asyncHandler(MeritController.getCutoff));
router.get('/:appId/status', asyncHandler(MeritController.getStatus));

export default router;
