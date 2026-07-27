import { z } from 'zod';

export const createPublicOrderSchema = z.object({
  productId: z.string().uuid(),
  customerName: z.string().min(2, 'Nom requis'),
  customerPhone: z.string().min(8, 'Numéro invalide'),
  deliveryAddress: z.string().min(2, 'Adresse de livraison requise'),
  quantity: z.coerce.number().int().min(1),
});