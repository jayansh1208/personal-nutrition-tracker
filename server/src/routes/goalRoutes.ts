import { Router } from 'express';
import { goalController } from '../controllers/goalController';
import { validateBody } from '../middleware/validator';
import { createGoalSchema, updateGoalSchema } from '../validators/goalValidator';

export const goalRouter = Router();

goalRouter.get('/', goalController.getGoals);
goalRouter.post('/', validateBody(createGoalSchema), goalController.createGoal);
goalRouter.put('/:id', validateBody(updateGoalSchema), goalController.updateGoal);
