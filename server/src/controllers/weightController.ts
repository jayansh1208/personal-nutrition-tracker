import { Request, Response, NextFunction } from 'express';
import { weightService } from '../services/weightService';
import { sendSuccess } from '../utils/response';

export class WeightController {
  async getWeight(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, limit } = req.query as {
        startDate?: string;
        endDate?: string;
        limit?: string;
      };
      const result = await weightService.getWeightHistory(startDate, endDate, limit ? parseInt(limit, 10) : undefined);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getWeightByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await weightService.getWeightByDate(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateWeight(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await weightService.addOrUpdateWeight(req.body);
      return sendSuccess(res, result, 'Weight entry saved successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateWeight(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await weightService.updateWeight(id, req.body);
      return sendSuccess(res, result, 'Weight entry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteWeight(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await weightService.deleteWeight(id);
      return sendSuccess(res, result, 'Weight entry deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const weightController = new WeightController();
