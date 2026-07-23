import { Request, Response } from 'express';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { requestOtp, verifyOtp } from '../services/otp.service';
import { signToken } from '../services/jwt.service';
import {
  requestOtpSchema,
  verifyOtpSchema,
  loginSchema,
  registerSchema,
} from '../validators/auth.validator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function handleRequestOtp(req: Request, res: Response) {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    await requestOtp(parsed.data.phone);
    return res.json({ message: 'Code OTP envoyé via WhatsApp' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Erreur lors de l'envoi de l'OTP" });
  }
}

export async function handleVerifyOtp(req: Request, res: Response) {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { phone, code } = parsed.data;
  const isValid = await verifyOtp(phone, code);

  if (!isValid) {
    return res.status(401).json({ error: 'Code invalide ou expiré' });
  }

  // Trouve ou crée le vendeur automatiquement
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    const baseSlug = slugify(`boutique-${phone.slice(-6)}`);
    user = await prisma.user.create({
      data: {
        phone,
        storeName: `Ma Boutique`,
        storeSlug: baseSlug,
      },
    });
  }

  const token = signToken({ userId: user.id, phone: user.phone });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.json({
    message: 'Connexion réussie',
    user: { id: user.id, phone: user.phone, storeName: user.storeName, storeSlug: user.storeSlug },
  });
}

export async function handleRegister(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { phone, password, storeName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return res.status(409).json({ error: 'Ce numéro est déjà enregistré' });
  }

  const passwordHash = await argon2.hash(password);
  const baseSlug = slugify(storeName);

  // Assure l'unicité du slug
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.user.findUnique({ where: { storeSlug: slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const user = await prisma.user.create({
    data: { phone, passwordHash, storeName, storeSlug: slug },
  });

  const token = signToken({ userId: user.id, phone: user.phone });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(201).json({
    message: 'Compte créé avec succès',
    user: { id: user.id, phone: user.phone, storeName: user.storeName, storeSlug: user.storeSlug },
  });
}

export async function handleLogin(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { phone, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = signToken({ userId: user.id, phone: user.phone });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.json({
    message: 'Connexion réussie',
    user: { id: user.id, phone: user.phone, storeName: user.storeName, storeSlug: user.storeSlug },
  });
}

export async function handleLogout(req: Request, res: Response) {
  res.clearCookie('token', COOKIE_OPTIONS);
  return res.json({ message: 'Déconnexion réussie' });
}