import { z } from 'zod';

export const MealCategoryEnum = z.enum([
  'BREAKFAST',
  'LUNCH',
  'EVENING_SNACK',
  'DINNER',
  'OTHER'
]);

export type MealCategory = z.infer<typeof MealCategoryEnum>;

export const createMealItemSchema = z.object({
  foodName: z.string().min(1, 'Food name is required').trim(),
  category: MealCategoryEnum,
  calories: z.coerce.number().min(0, 'Calories must be 0 or positive'),
  protein: z.coerce.number().min(0, 'Protein must be 0 or positive'),
  quantity: z.coerce.number().min(0, 'Quantity must be positive').optional().nullable(),
  quantityUnit: z.string().default('g').optional(),
  notes: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional()
});

export const updateMealItemSchema = z.object({
  foodName: z.string().min(1, 'Food name is required').trim().optional(),
  category: MealCategoryEnum.optional(),
  calories: z.coerce.number().min(0, 'Calories must be 0 or positive').optional(),
  protein: z.coerce.number().min(0, 'Protein must be 0 or positive').optional(),
  quantity: z.coerce.number().min(0, 'Quantity must be positive').optional().nullable(),
  quantityUnit: z.string().optional(),
  notes: z.string().optional().nullable()
});

export const createMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  category: MealCategoryEnum,
  items: z.array(createMealItemSchema).optional()
});

export const updateMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  category: MealCategoryEnum.optional()
});
