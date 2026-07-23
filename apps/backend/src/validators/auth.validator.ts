import { z } from 'zod';

export const requestOtpSchema = z.object({
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .regex(/^\+?[0-9]{8,15}$/, 'Format de numéro invalide'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8),
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

export const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(6, 'Mot de passe trop court'),
});

export const registerSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(6),
  storeName: z.string().min(2, 'Nom de boutique requis'),
});