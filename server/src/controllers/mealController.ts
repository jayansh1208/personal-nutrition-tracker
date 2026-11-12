import { Request, Response, NextFunction } from 'express';
import { mealService } from '../services/mealService';
import { sendSuccess, sendError } from '../utils/response';

export class MealController {
  async getMeals(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await mealService.getMealsByDate(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMealById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const meal = await mealService.getMealById(id);
      if (!meal) {
        return sendError(res, 'Meal not found', 404);
      }
      return sendSuccess(res, meal);
    } catch (error) {
      next(error);
    }
  }

  async createMealItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mealService.addMealItem(req.body);
      return sendSuccess(res, result, 'Meal item added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMealItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await mealService.updateMealItem(id, req.body);
      return sendSuccess(res, result, 'Meal item updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMealItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await mealService.deleteMealItem(id);
      return sendSuccess(res, result, 'Meal item deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMeal(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await mealService.deleteMeal(id);
      return sendSuccess(res, result, 'Meal category cleared successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const mealController = new MealController();
