import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { connectWhatsAppSchema, sendRelanceSchema } from '../validators/whatsapp.validator';
import {
  startWhatsAppConnection,
  disconnectWhatsApp,
  sendRelanceMessage,
} from '../services/baileys.service';

export async function connectWhatsApp(req: AuthRequest, res: Response) {
  const parsed = connectWhatsAppSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const vendeurId = req.user!.id;

  try {
    const result = await startWhatsAppConnection(vendeurId, parsed.data.phoneNumber);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur de connexion WhatsApp' });
  }
}

export async function getWhatsAppStatus(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const session = await prisma.whatsAppSession.findUnique({ where: { vendeurId } });

  return res.json({
    connected: session?.isConnected || false,
    phoneNumber: session?.phoneNumber || null,
  });
}

export async function disconnectWhatsAppHandler(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  await disconnectWhatsApp(vendeurId);
  return res.json({ message: 'WhatsApp déconnecté' });
}

export async function sendRelance(req: AuthRequest, res: Response) {
  const parsed = sendRelanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const vendeurId = req.user!.id;

  try {
    await sendRelanceMessage(vendeurId, parsed.data.customerPhone, parsed.data.message);
    return res.json({ message: 'Message envoyé' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function checkContactEligibility(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const { phone } = req.params;

  const activity = await prisma.whatsAppContactActivity.findUnique({
    where: { vendeurId_customerPhone: { vendeurId, customerPhone: phone } },
  });

  if (!activity) {
    return res.json({ eligible: false });
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const eligible = activity.lastMessageAt >= twentyFourHoursAgo;

  return res.json({ eligible, lastMessageAt: activity.lastMessageAt });
}