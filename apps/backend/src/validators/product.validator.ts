import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(2, 'Titre requis'),
  description: z.string().optional(),
  priceSelling: z.coerce.number().positive('Prix de vente invalide'),
  priceWholesale: z.coerce.number().positive('Prix grossiste invalide'),
  stockQty: z.coerce.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();