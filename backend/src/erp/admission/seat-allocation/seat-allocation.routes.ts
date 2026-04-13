import { Router } from 'express';
import { asyncHandler } from '../../../middleware/error.middleware.js';
import SeatController from './seat-allocation.controller.js';

const router = Router();

router.get('/availability', asyncHandler(SeatController.getAvailability));
router.post('/allocate', asyncHandler(SeatController.allocateSeat));
router.get('/:appId/allocation', asyncHandler(SeatController.getAllocationDetails));
router.put('/:appId/upgrade', asyncHandler(SeatController.upgradeSeat));
router.delete('/:appId/cancel', asyncHandler(SeatController.cancelSeat));
router.get('/waitlist', asyncHandler(SeatController.getWaitlist));

export default router;
