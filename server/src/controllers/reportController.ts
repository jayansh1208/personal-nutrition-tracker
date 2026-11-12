import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService';
import { sendSuccess } from '../utils/response';

export class ReportController {
  async getDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await reportService.getDailyReport(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = (req.query.startDate || req.query.date) as string | undefined;
      const result = await reportService.getWeeklyReport(startDate);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month as string | undefined;
      const result = await reportService.getMonthlyReport(month);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as string) || 'nutrition';

      if (type === 'backup' || type === 'json') {
        const backup = await reportService.exportFullBackup();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="nutritrack_backup_${Date.now()}.json"`);
        return res.send(JSON.stringify(backup, null, 2));
      }

      const { filename, content } = await reportService.exportCSV(type as any);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(content);
    } catch (error) {
      next(error);
    }
  }

  async clearData(req: Request, res: Response, next: NextFunction) {
    try {
      const { confirmation } = req.body;
      const result = await reportService.clearAllData(confirmation);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
