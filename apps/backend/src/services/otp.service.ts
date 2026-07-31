import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { sendWhatsAppOtp } from './whatsapp.service';
import { sendTelegramOtp } from './telegramBot.service';
import { sendEmailOtp } from './resend.service';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export type OtpChannel = 'whatsapp' | 'telegram' | 'email';

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export function isEmail(target: string): boolean {
  return target.includes('@');
}

export interface VerifyOtpResult {
  success: boolean;
  message?: string;
}

export async function verifyOtp(target: string, code: string): Promise<VerifyOtpResult> {
  const isTargetEmail = isEmail(target);
  const normalizedTarget = isTargetEmail ? target.toLowerCase().trim() : formatPhoneNumber(target);

  const otpRecord = await prisma.otpCode.findFirst({
    where: isTargetEmail ? { email: normalizedTarget } : { phone: normalizedTarget },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    return { success: false, message: 'Aucun code OTP trouvé pour cette adresse ou numéro.' };
  }

  // Vérification du blocage (15 minutes après 5 échecs)
  if (otpRecord.blockedUntil && otpRecord.blockedUntil > new Date()) {
    const minutesLeft = Math.ceil((otpRecord.blockedUntil.getTime() - Date.now()) / (60 * 1000));
    return {
      success: false,
      message: `Nombre maximal de tentatives atteint (5). Veuillez patienter encore ${minutesLeft} minute(s) avant de réessayer.`,
    };
  }

  if (otpRecord.expiresAt < new Date()) {
    await prisma.otpCode.delete({ where: { id: otpRecord.id } });
    return { success: false, message: 'Le code OTP a expiré. Veuillez en demander un nouveau.' };
  }

  const isValid = await argon2.verify(otpRecord.codeHash, code);

  if (!isValid) {
    const newAttempts = otpRecord.attempts + 1;
    let blockedUntil: Date | null = null;
    if (newAttempts >= MAX_ATTEMPTS) {
      blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes de blocage
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: {
        attempts: { increment: 1 },
        ...(blockedUntil && { blockedUntil }),
      },
    });

    if (newAttempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        message: 'Nombre maximal de tentatives (5) atteint. Votre compte est bloqué pendant 15 minutes.',
      };
    }

    return {
      success: false,
      message: `Code OTP incorrect. Il vous reste ${MAX_ATTEMPTS - newAttempts} tentative(s).`,
    };
  }

  // Code valide -> Suppression du record OTP
  await prisma.otpCode.delete({ where: { id: otpRecord.id } });
  return { success: true };
}

export async function requestOtp(target: string, channel: OtpChannel): Promise<void> {
  const isTargetEmail = isEmail(target);
  const normalizedTarget = isTargetEmail ? target.toLowerCase().trim() : formatPhoneNumber(target);

  // Vérification du statut de blocage existant
  const existingOtp = await prisma.otpCode.findFirst({
    where: isTargetEmail ? { email: normalizedTarget } : { phone: normalizedTarget },
    orderBy: { createdAt: 'desc' },
  });

  if (existingOtp && existingOtp.blockedUntil && existingOtp.blockedUntil > new Date()) {
    const minutesLeft = Math.ceil((existingOtp.blockedUntil.getTime() - Date.now()) / (60 * 1000));
    throw new Error(
      `Compte temporairement bloqué suite à 5 tentatives infructueuses. Veuillez patienter ${minutesLeft} minute(s).`
    );
  }

  const code = generateSixDigitCode();
  const codeHash = await argon2.hash(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Nettoyage des anciens codes pour cette cible
  if (isTargetEmail) {
    await prisma.otpCode.deleteMany({ where: { email: normalizedTarget } });
  } else {
    await prisma.otpCode.deleteMany({ where: { phone: normalizedTarget } });
  }

  await prisma.otpCode.create({
    data: {
      phone: isTargetEmail ? null : normalizedTarget,
      email: isTargetEmail ? normalizedTarget : null,
      channel,
      codeHash,
      expiresAt,
    },
  });

  if (channel === 'email') {
    if (!isTargetEmail) {
      throw new Error("Une adresse e-mail valide est requise pour le canal e-mail.");
    }
    await sendEmailOtp(normalizedTarget, code);
  } else if (channel === 'telegram') {
    await sendTelegramOtp(normalizedTarget, code);
  } else {
    await sendWhatsAppOtp(normalizedTarget, code);
  }
}