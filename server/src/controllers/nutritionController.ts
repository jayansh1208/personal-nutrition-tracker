import { Request, Response, NextFunction } from 'express';
import { nutritionService } from '../services/nutritionService';
import { sendSuccess } from '../utils/response';

export class NutritionController {
  async getDailyNutrition(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await nutritionService.getDailyNutrition(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyNutrition(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = (req.query.startDate || req.query.date) as string | undefined;
      const result = await nutritionService.getWeeklyNutrition(startDate);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyNutrition(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month as string | undefined;
      const result = await nutritionService.getMonthlyNutrition(month);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const nutritionController = new NutritionController();
