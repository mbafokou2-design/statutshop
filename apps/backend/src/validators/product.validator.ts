import { z } from 'zod';

export const productCategoryEnum = z.enum([
  'VETEMENTS',
  'SACS_ACCESSOIRES',
  'CHAUSSURES',
  'BEAUTE_CHEVEUX',
  'HIGH_TECH_GADGETS',
]);


const booleanFromString = z.preprocess((val) => {
  if (typeof val === 'string') return val === 'true';
  return val;
}, z.boolean());

export const createProductSchema = z.object({
  title: z.string().min(2, 'Titre requis'),
  description: z.string().optional(),
  category: productCategoryEnum,
  priceSelling: z.coerce.number().positive('Prix de vente invalide'),
  priceWholesale: z.coerce.number().positive('Prix grossiste invalide'),
  stockQty: z.coerce.number().int().min(0).default(0),
  isAvailable: booleanFromString.default(true),
  isActive: booleanFromString.default(true),
});

export const updateProductSchema = createProductSchema.partial();