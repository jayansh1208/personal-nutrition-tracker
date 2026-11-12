import { z } from 'zod';

export const updateSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required').optional(),
  defaultWeightUnit: z.enum(['kg', 'lbs']).optional(),
  defaultCalorieUnit: z.enum(['kcal', 'kJ']).optional()
});
