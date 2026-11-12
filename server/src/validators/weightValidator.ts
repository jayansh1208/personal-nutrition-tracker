import { z } from 'zod';

export const createWeightSchema = z.object({
  weightKg: z.coerce.number().min(20, 'Weight must be at least 20 kg').max(500, 'Weight must be realistic'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  recordedAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  notes: z.string().optional().nullable()
});

export const updateWeightSchema = z.object({
  weightKg: z.coerce.number().min(20, 'Weight must be at least 20 kg').max(500, 'Weight must be realistic').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  recordedAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  notes: z.string().optional().nullable()
});
