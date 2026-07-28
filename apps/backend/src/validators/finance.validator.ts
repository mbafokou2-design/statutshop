import { z } from 'zod';

export const financeQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month']).default('month'),
});