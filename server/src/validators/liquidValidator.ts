import { z } from 'zod';

export const createLiquidSchema = z.object({
  drinkName: z.string().min(1, 'Drink name is required').trim().default('Water'),
  quantityMl: z.coerce.number().positive('Quantity must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  consumedAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional()
});

export const updateLiquidSchema = z.object({
  drinkName: z.string().min(1, 'Drink name is required').trim().optional(),
  quantityMl: z.coerce.number().positive('Quantity must be greater than 0').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  consumedAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional()
});
