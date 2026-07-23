import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { sendWhatsAppOtp } from './whatsapp.service';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOtp(phone: string): Promise<void> {
  const code = generateSixDigitCode();
  const codeHash = await argon2.hash(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Supprime les anciens OTP non utilisés pour ce numéro
  await prisma.otpCode.deleteMany({ where: { phone } });

  await prisma.otpCode.create({
    data: { phone, codeHash, expiresAt },
  });

  await sendWhatsAppOtp(phone, code);
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
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

  // OTP valide -> on le supprime (usage unique)
  await prisma.otpCode.delete({ where: { id: otpRecord.id } });
  return true;
}