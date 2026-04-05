import { Request, Response } from 'express';
import SeatModel from './seat-allocation.model.js';
import { ok, created } from '../../academics/core/academics.utils.js';

const SeatController = {
  async getAvailability(req: Request, res: Response) {
    const { courseId, category } = req.query;
    const result = await SeatModel.getAvailability(courseId as string, category as string);
    ok(res, result);
  },

  async allocateSeat(req: Request, res: Response) {
    const { appId, courseId, category } = req.body;
    if (!appId || !courseId || !category) throw new Error('Missing required fields');
    const result = await SeatModel.allocateSeat(appId, courseId, category);
    created(res, result);
  },

  async getAllocationDetails(req: Request, res: Response) {
    const { appId } = req.params;
    const result = await SeatModel.getAllocationDetails(String(appId));
    ok(res, result);
  },

  async upgradeSeat(req: Request, res: Response) {
    const { appId } = req.params;
    const result = await SeatModel.upgradeSeat(String(appId));
    ok(res, result);
  },

  async cancelSeat(req: Request, res: Response) {
    const { appId } = req.params;
    const result = await SeatModel.cancelSeat(String(appId));
    ok(res, result);
  },

  async getWaitlist(req: Request, res: Response) {
    const result = await SeatModel.getWaitlist();
    ok(res, result);
  }
};

export default SeatController;
