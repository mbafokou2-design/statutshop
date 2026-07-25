import { z } from 'zod';

export const requestOtpSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  channel: z.enum(['telegram', 'sms']),
  mode: z.enum(['register', 'login', 'reset_password']),
  storeName: z.string().optional(),
  password: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  code: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
  storeName: z.string().optional(),
  mode: z.enum(['register', 'login', 'reset_password']).optional(),
  password: z.string().optional(),
});

// 🟢 Ajoute cet export si absente
export const loginSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// 🟢 Ajoute cet export si absente
export const registerSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  storeName: z.string().min(2, 'Le nom de la boutique est requis'),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  code: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});