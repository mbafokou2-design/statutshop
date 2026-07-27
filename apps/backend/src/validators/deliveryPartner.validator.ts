import { z } from 'zod';

export const listDeliveryPartnersQuerySchema = z.object({
  city: z.string().optional(),
  zone: z.string().optional(),
});

export const rateDeliveryPartnerSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
});