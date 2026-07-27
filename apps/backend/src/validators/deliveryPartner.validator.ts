import { z } from 'zod';

export const listDeliveryPartnersQuerySchema = z.object({
  city: z.string().optional(),
  zone: z.string().optional(),
});