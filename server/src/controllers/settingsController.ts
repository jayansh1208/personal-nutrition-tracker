import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settingsService';
import { sendSuccess } from '../utils/response';

export class SettingsController {
  async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getSettings();
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateSettings(req.body);
      return sendSuccess(res, result, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
