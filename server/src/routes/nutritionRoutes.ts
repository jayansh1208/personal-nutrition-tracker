import { Router } from 'express';
import { nutritionController } from '../controllers/nutritionController';

export const nutritionRouter = Router();

nutritionRouter.get('/daily', nutritionController.getDailyNutrition);
nutritionRouter.get('/weekly', nutritionController.getWeeklyNutrition);
nutritionRouter.get('/monthly', nutritionController.getMonthlyNutrition);
