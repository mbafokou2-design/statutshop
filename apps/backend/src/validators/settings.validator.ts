import { z } from 'zod';

export const updateSettingsSchema = z.object({
  storeName: z.string().min(2).optional(),
  whatsappBusinessNum: z.string().min(8).optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  description: z.string().optional(),
});