import { Request, Response } from 'express';
import MeritModel from './merit-result.model.js';
import { ok, created } from '../../academics/core/academics.utils.js';

const MeritController = {
  async generateMeritList(req: Request, res: Response) {
    const { courseId } = req.body;
    if (!courseId) throw new Error('Course ID is required');
    const result = await MeritModel.generateMeritList(courseId);
    ok(res, result);
  },

  async listMeritList(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await MeritModel.listMeritList(page, limit);
    ok(res, result);
  },

  async getRank(req: Request, res: Response) {
    const { appId } = req.params;
    const result = await MeritModel.getRank(String(appId));
    ok(res, result);
  },

  async publish(req: Request, res: Response) {
    const result = await MeritModel.publishMeritList();
    ok(res, result);
  },

  async getCutoff(req: Request, res: Response) {
    const result = await MeritModel.getCutoff();
    ok(res, result);
  },

  async getStatus(req: Request, res: Response) {
    const { appId } = req.params;
    const result = await MeritModel.getStatus(String(appId));
    ok(res, result);
  }
};

export default MeritController;
