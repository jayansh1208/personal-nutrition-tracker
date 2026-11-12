import { z } from 'zod';

export const createGoalSchema = z.object({
  calorieTarget: z.coerce.number().min(500, 'Calorie target must be at least 500 kcal').max(10000),
  proteinTarget: z.coerce.number().min(10, 'Protein target must be at least 10 g').max(1000),
  liquidTarget: z.coerce.number().min(500, 'Liquid target must be at least 500 ml').max(20000),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional()
});

export const updateGoalSchema = createGoalSchema.partial();
