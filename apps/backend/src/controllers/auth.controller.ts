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
  resetPasswordSchema,
} from '../validators/auth.validator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// 🟢 1. DEMANDE OTP (Gestion Mode Register / Login / Reset Password)
export async function handleRequestOtp(req: Request, res: Response) {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { channel, mode } = req.body;
  const phone = formatPhoneNumber(parsed.data.phone);

  // 🔴 Vérification explicite de l'existence du compte en BDD
  const existingUser = await prisma.user.findUnique({ where: { phone } });

  // CAS 1: Inscription alors que le compte existe déjà
  if (mode === 'register' && existingUser) {
    return res.status(409).json({ 
      error: 'Un compte StatutShop existe déjà avec ce numéro. Veuillez vous connecter.' 
    });
  }

  // CAS 2: Connexion ou Réinitialisation alors que le compte N'EXISTE PAS en BDD
  if ((mode === 'login' || mode === 'reset_password') && !existingUser) {
    return res.status(404).json({ 
      error: "Aucun compte StatutShop trouvé pour ce numéro. Veuillez d'abord créer un compte." 
    });
  }

  try {
    await requestOtp(phone, channel);
    return res.json({ message: 'Code OTP envoyé avec succès' });
  } catch (err: any) {
    // Si le numéro n'est pas encore démarré sur le bot Telegram
    if (channel === 'telegram' && err.message?.includes("pas encore lié")) {
      const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'StatutShopBot';
      const cleanPhone = phone.replace('+', '');
      const telegramLink = `https://t.me/${botUsername}?start=${cleanPhone}`;

      return res.status(400).json({
        error: err.message,
        telegramLink,
      });
    }

    return res.status(500).json({ error: err.message || "Erreur lors de l'envoi de l'OTP" });
  }
}

// 🟢 2. VÉRIFICATION OTP ET CRÉATION DE COMPTE (Inscription)
export async function handleVerifyOtp(req: Request, res: Response) {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { code, storeName, mode, password } = req.body;
  const phone = formatPhoneNumber(parsed.data.phone);

  const isValid = await verifyOtp(phone, code);
  if (!isValid) {
    return res.status(401).json({ error: 'Code OTP invalide ou expiré' });
  }

  let user = await prisma.user.findUnique({ where: { phone } });

  if (mode === 'register' && user) {
    return res.status(409).json({ error: 'Ce compte existe déjà. Veuillez vous connecter.' });
  }

  // Création de compte lors de l'inscription
  if (!user) {
    if (!password) {
      return res.status(400).json({ error: 'Le mot de passe est obligatoire pour créer un compte.' });
    }

    const passwordHash = await argon2.hash(password);
    const finalStoreName = storeName || `Boutique-${phone.slice(-4)}`;
    const baseSlug = slugify(finalStoreName);

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { storeSlug: slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        storeName: finalStoreName,
        storeSlug: slug,
        whatsappBusinessNum: phone,
        logoUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1784994033/How_i_grew_my_business_using_Shopify_j2hs8v.jpg',
        coverUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1784994034/t%C3%A9l%C3%A9charger_zzeoxu.jpg',
        description: 'Bienvenue dans notre boutique ! Découvrez nos produits de qualité.',
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

// 🟢 3. RÉINITIALISATION DU MOT DE PASSE (Reset Password)
export async function handleResetPassword(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { code, newPassword } = parsed.data;
  const phone = formatPhoneNumber(parsed.data.phone);

  // 1. Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return res.status(404).json({ error: "Aucun compte trouvé avec ce numéro." });
  }

  // 2. Valider l'OTP
  const isValid = await verifyOtp(phone, code);
  if (!isValid) {
    return res.status(401).json({ error: 'Code OTP invalide ou expiré' });
  }

  // 3. Hasher le nouveau mot de passe et mettre à jour le compte
  const passwordHash = await argon2.hash(newPassword);
  const updatedUser = await prisma.user.update({
    where: { phone },
    data: { passwordHash },
  });

  // 4. Connecter directement l'utilisateur
  const token = signToken({ userId: updatedUser.id, phone: updatedUser.phone });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.json({
    message: 'Mot de passe modifié avec succès',
    user: { 
      id: updatedUser.id, 
      phone: updatedUser.phone, 
      storeName: updatedUser.storeName, 
      storeSlug: updatedUser.storeSlug 
    },
  });
}

// 🟢 4. CONNEXION CLASSIQUE
export async function handleLogin(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { password } = parsed.data;
  const phone = formatPhoneNumber(parsed.data.phone);

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Identifiants incorrects ou compte inexistant.' });
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

export async function handleRegister(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { password, storeName } = parsed.data;
  const phone = formatPhoneNumber(parsed.data.phone);

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return res.status(409).json({ error: 'Ce numéro est déjà enregistré' });
  }

  const passwordHash = await argon2.hash(password);
  const baseSlug = slugify(storeName);

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.user.findUnique({ where: { storeSlug: slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const user = await prisma.user.create({
    data: {
      phone,
      passwordHash,
      storeName,
      storeSlug: slug,
      whatsappBusinessNum: phone,
      logoUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1784994033/How_i_grew_my_business_using_Shopify_j2hs8v.jpg',
      coverUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1784994034/t%C3%A9l%C3%A9charger_zzeoxu.jpg',
      description: 'Bienvenue dans notre boutique ! Découvrez nos produits de qualité.',
    },
  });

  const token = signToken({ userId: user.id, phone: user.phone });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(201).json({
    message: 'Compte créé avec succès',
    user: { id: user.id, phone: user.phone, storeName: user.storeName, storeSlug: user.storeSlug },
  });
}
// 🟢 5. DÉCONNEXION
export async function handleLogout(req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.json({ message: 'Déconnexion réussie' });
}





