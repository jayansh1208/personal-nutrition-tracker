import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

export const analyticsRouter = Router();

analyticsRouter.get('/weekly', analyticsController.getWeeklyAnalytics);
analyticsRouter.get('/monthly', analyticsController.getMonthlyAnalytics);
analyticsRouter.get('/weight', analyticsController.getWeightAnalytics);
