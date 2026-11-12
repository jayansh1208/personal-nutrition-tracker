import { Router } from 'express';
import { reportController } from '../controllers/reportController';

export const reportRouter = Router();

reportRouter.get('/daily', reportController.getDailyReport);
reportRouter.get('/weekly', reportController.getWeeklyReport);
reportRouter.get('/monthly', reportController.getMonthlyReport);
reportRouter.get('/export', reportController.exportData);
reportRouter.post('/clear', reportController.clearData);
