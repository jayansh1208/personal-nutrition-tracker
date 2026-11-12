import { Router } from 'express';
import { weightController } from '../controllers/weightController';
import { validateBody } from '../middleware/validator';
import { createWeightSchema, updateWeightSchema } from '../validators/weightValidator';

export const weightRouter = Router();

weightRouter.get('/', weightController.getWeight);
weightRouter.get('/date', weightController.getWeightByDate);
weightRouter.post('/', validateBody(createWeightSchema), weightController.createOrUpdateWeight);
weightRouter.put('/:id', validateBody(updateWeightSchema), weightController.updateWeight);
weightRouter.delete('/:id', weightController.deleteWeight);
