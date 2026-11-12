import { Router } from 'express';
import { mealRouter, mealItemRouter } from './mealRoutes';
import { liquidRouter } from './liquidRoutes';
import { weightRouter } from './weightRoutes';
import { goalRouter } from './goalRoutes';
import { nutritionRouter } from './nutritionRoutes';
import { analyticsRouter } from './analyticsRoutes';
import { reportRouter } from './reportRoutes';
import { settingsRouter } from './settingsRoutes';

export const apiRouter = Router();

apiRouter.use('/meals', mealRouter);
apiRouter.use('/meal-items', mealItemRouter);
apiRouter.use('/liquid', liquidRouter);
apiRouter.use('/weight', weightRouter);
apiRouter.use('/goals', goalRouter);
apiRouter.use('/nutrition', nutritionRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/settings', settingsRouter);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default apiRouter;
