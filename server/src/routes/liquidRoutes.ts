import { Router } from 'express';
import { liquidController } from '../controllers/liquidController';
import { validateBody } from '../middleware/validator';
import { createLiquidSchema, updateLiquidSchema } from '../validators/liquidValidator';

export const liquidRouter = Router();

liquidRouter.get('/', liquidController.getLiquids);
liquidRouter.post('/', validateBody(createLiquidSchema), liquidController.createLiquid);
liquidRouter.put('/:id', validateBody(updateLiquidSchema), liquidController.updateLiquid);
liquidRouter.delete('/:id', liquidController.deleteLiquid);
