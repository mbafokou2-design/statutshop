
import { Request, Response } from 'express';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { requestOtp, verifyOtp } from '../services/otp.service';
import { signToken } from '../services/jwt.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  requestOtpSchema,
  verifyOtpSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  changePasswordSchema,
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

  // 👈 WhatsApp par défaut si 'channel' n'est pas envoyé
  const { channel = 'whatsapp', mode } = req.body;
  const phone = formatPhoneNumber(parsed.data.phone);

  const existingUser = await prisma.user.findUnique({ where: { phone } });

  if (mode === 'register' && existingUser) {
    return res.status(409).json({
      error: 'Un compte StatutShop existe déjà avec ce numéro. Veuillez vous connecter.'
    });
  }

  if ((mode === 'login' || mode === 'reset_password') && !existingUser) {
    return res.status(404).json({
      error: "Aucun compte StatutShop trouvé pour ce numéro. Veuillez d'abord créer un compte."
    });
  }

  try {
    await requestOtp(phone, channel);
    return res.json({ message: 'Code OTP envoyé sur WhatsApp avec succès' });
  } catch (err: any) {
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

// 🟢 2. VÉRIFICATION OTP ET CRÉATION DE COMPTE
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
        logoUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1785260830/StatutShop_p66wdk.png',
        coverUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1785260830/StatutShop_p66wdk.png',
        description: 'Bienvenue dans notre boutique ! Découvrez nos produits de qualité.',
      },
    });
  }

  if (user && !user.isActive) {
    return res.status(403).json({ error: 'Votre boutique a été suspendue. Contactez le support.' });
  }

  const token = signToken({ id: user.id, phone: user.phone, role: user.role });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(201).json({
    message: 'Compte créé avec succès',
    token,
    user: {
      id: user.id,
      phone: user.phone,
      storeName: user.storeName,
      storeSlug: user.storeSlug,
      role: user.role,
      visitCount: user.visitCount || 0,
    },
  });
}

// 🟢 3. RÉINITIALISATION DU MOT DE PASSE
export async function handleResetPassword(req: Request, res: Response) {
  try {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // verifyOtp va nettoyer et formater le numéro automatiquement grâce à notre mise à jour
    const isValidOtp = await verifyOtp(phone, code);
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Code OTP invalide ou expiré.' });
    }

    const cleaned = phone.replace(/\s+/g, '');
    const formattedPhone = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { phone: formattedPhone },
      data: {
        passwordHash: hashedPassword // 👈 Utilise passwordHash (ou password_hash selon ton schema.prisma)
      },
    });

    return res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch (error) {
    console.error('❌ Erreur handleResetPassword:', error);
    return res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe.' });
  }
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

  if (user && !user.isActive) {
    return res.status(403).json({ error: 'Votre boutique a été suspendue. Contactez le support.' });
  }

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = signToken({ id: user.id, phone: user.phone, role: user.role });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(200).json({
    message: 'Connexion réussie',
    token,
    user: {
      id: user.id,
      phone: user.phone,
      storeName: user.storeName,
      storeSlug: user.storeSlug,
      role: user.role,
      visitCount: user.visitCount || 0,
    },
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
      logoUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1785260830/StatutShop_p66wdk.png',
      coverUrl: 'https://res.cloudinary.com/dafs2tmoi/image/upload/v1785260830/StatutShop_p66wdk.png',
      description: 'Bienvenue dans notre boutique ! Découvrez nos produits de qualité.',
    },
  });

  const token = signToken({ id: user.id, phone: user.phone, role: user.role });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(201).json({
    message: 'Compte créé avec succès',
    token,
    user: {
      id: user.id,
      phone: user.phone,
      storeName: user.storeName,
      storeSlug: user.storeSlug,
      role: user.role,
      visitCount: user.visitCount || 0,
    },
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

// 🟢 6. CHANGEMENT DE MOT DE PASSE (Connecté)
export async function handleChangePassword(req: AuthRequest, res: Response) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { currentPassword, newPassword } = parsed.data;
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  if (user.passwordHash) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel requis' });
    }
    const isValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }
  }

  const newHash = await argon2.hash(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  return res.json({ message: 'Mot de passe mis à jour avec succès' });
}

// 🟢 7. STATUT LIAISON TELEGRAM
export async function getTelegramStatus(req: AuthRequest, res: Response) {
  const phone = req.user!.phone;

  const link = await prisma.telegramLink.findUnique({ where: { phone } });

  return res.json({
    linked: Boolean(link),
    botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
  });
}


// 🟢 STATUT LIAISON WHATSAPP (Basé uniquement sur l'utilisateur connecté)
export async function getWhatsAppStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const merchant = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.json({
      linked: Boolean(merchant.phone),
      phoneNumber: merchant.phone,
    });
  } catch (error) {
    console.error('❌ Erreur getWhatsAppStatus:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du statut WhatsApp' });
  }

}


// 🟢 9. GET ME — Retourne l'utilisateur connecté avec son rôle à jour
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // req.user.id est garanti non-null depuis le middleware requireAuth
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        role: true,
        storeName: true,
        storeSlug: true,
        visitCount: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};


