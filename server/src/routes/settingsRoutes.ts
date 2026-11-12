import { Router } from 'express';
import { settingsController } from '../controllers/settingsController';
import { validateBody } from '../middleware/validator';
import { updateSettingsSchema } from '../validators/settingsValidator';

export const settingsRouter = Router();

settingsRouter.get('/', settingsController.getSettings);
settingsRouter.put('/', validateBody(updateSettingsSchema), settingsController.updateSettings);
