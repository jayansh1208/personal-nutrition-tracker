import { Request, Response, NextFunction } from 'express';
import { goalService } from '../services/goalService';
import { sendSuccess } from '../utils/response';

export class GoalController {
  async getGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const current = await goalService.getEffectiveGoal(date);
      const all = await goalService.getAllGoals();
      return sendSuccess(res, { current, all });
    } catch (error) {
      next(error);
    }
  }

  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await goalService.createGoal(req.body);
      return sendSuccess(res, result, 'Daily goals saved successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await goalService.updateGoal(id, req.body);
      return sendSuccess(res, result, 'Daily goals updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const goalController = new GoalController();
