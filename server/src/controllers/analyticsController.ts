import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
  async getWeeklyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await analyticsService.getWeeklyAnalytics(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month as string | undefined;
      const result = await analyticsService.getMonthlyAnalytics(month);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getWeightAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getWeightAnalytics();
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
