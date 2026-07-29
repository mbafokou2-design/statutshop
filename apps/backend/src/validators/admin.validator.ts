import { z } from 'zod';

export const updateShopStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createAdminDeliveryPartnerSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  whatsappNum: z.string().min(8),
  city: z.string().min(1),
  coveredZones: z.array(z.string()).default([]),
  vehicleType: z.enum(['MOTO', 'CAR', 'BICYCLE', 'WALKING']),
  basePrice: z.string().optional(),
  cniNumber: z.string().min(1),
  cniPhotoUrl: z.string().min(1),
  isVerified: z.boolean().default(true),
});