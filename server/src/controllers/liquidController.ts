import { Request, Response, NextFunction } from 'express';
import { liquidService } from '../services/liquidService';
import { sendSuccess } from '../utils/response';

export class LiquidController {
  async getLiquids(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await liquidService.getLiquidByDate(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createLiquid(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await liquidService.addLiquid(req.body);
      return sendSuccess(res, result, 'Liquid entry added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateLiquid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await liquidService.updateLiquid(id, req.body);
      return sendSuccess(res, result, 'Liquid entry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteLiquid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await liquidService.deleteLiquid(id);
      return sendSuccess(res, result, 'Liquid entry deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const liquidController = new LiquidController();
