import { z } from 'zod';

export const connectWhatsAppSchema = z.object({
  phoneNumber: z.string().min(8, 'Numéro invalide'),
});

export const sendRelanceSchema = z.object({
  customerPhone: z.string().min(8),
  message: z.string().min(1, 'Message requis'),
});