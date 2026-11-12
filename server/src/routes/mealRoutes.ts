import { Router } from 'express';
import { mealController } from '../controllers/mealController';
import { validateBody } from '../middleware/validator';
import { createMealItemSchema, updateMealItemSchema } from '../validators/mealValidator';

export const mealRouter = Router();

mealRouter.get('/', mealController.getMeals);
mealRouter.post('/', validateBody(createMealItemSchema), mealController.createMealItem);
mealRouter.get('/:id', mealController.getMealById);
mealRouter.delete('/:id', mealController.deleteMeal);

// Nested route: POST /api/meals/:mealId/items
mealRouter.post('/:mealId/items', validateBody(createMealItemSchema), mealController.createMealItem);

export const mealItemRouter = Router();

mealItemRouter.post('/', validateBody(createMealItemSchema), mealController.createMealItem);
mealItemRouter.put('/:id', validateBody(updateMealItemSchema), mealController.updateMealItem);
mealItemRouter.delete('/:id', mealController.deleteMealItem);
