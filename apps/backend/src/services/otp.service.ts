import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { sendWhatsAppOtp } from './whatsapp.service';
import { sendTelegramOtp } from './telegramBot.service';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 1000;

// 1. On remplace 'sms' par 'whatsapp' dans le type
export type OtpChannel = 'whatsapp' | 'telegram';

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function verifyOtp(rawPhone: string, code: string): Promise<boolean> {
  // 🟢 On formate systématiquement le numéro avant de chercher en BDD
  const phone = formatPhoneNumber(rawPhone);

  const otpRecord = await prisma.otpCode.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) return false;
  if (otpRecord.expiresAt < new Date()) {
    await prisma.otpCode.delete({ where: { id: otpRecord.id } });
    return false;
  }
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await prisma.otpCode.delete({ where: { id: otpRecord.id } });
    return false;
  }

  const isValid = await argon2.verify(otpRecord.codeHash, code);

  if (!isValid) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.otpCode.delete({ where: { id: otpRecord.id } });
  return true;
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export async function requestOtp(rawPhone: string, channel: OtpChannel): Promise<void> {
  const phone = formatPhoneNumber(rawPhone);
  const code = generateSixDigitCode();
  const codeHash = await argon2.hash(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.deleteMany({ where: { phone } });

  await prisma.otpCode.create({
    data: { phone, channel, codeHash, expiresAt },
  });

  // 2. Routage dynamique selon le canal choisi
  if (channel === 'telegram') {
    await sendTelegramOtp(phone, code);
  } else {
    // Par défaut / 'whatsapp' : Envoi via Zindua
    await sendWhatsAppOtp(phone, code);
  }
}