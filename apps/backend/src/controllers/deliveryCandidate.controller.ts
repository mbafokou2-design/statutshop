import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  whatsappNum: z.string().min(8, 'Numéro WhatsApp invalide'),
  city: z.string().min(1, 'La ville est requise'),
  coveredZones: z.array(z.string()).default([]),
  vehicleType: z.enum(['MOTO', 'CAR', 'BICYCLE', 'WALKING']),
  basePrice: z.string().optional(),
  cniNumber: z.string().min(1, 'Le numéro CNI est requis'),
  motivation: z.string().optional(),
});

export async function submitDeliveryCandidate(req: Request, res: Response) {
  const parsed = createCandidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  // Vérifier si un candidat avec ce numéro existe déjà
  const existing = await prisma.deliveryCandidate.findUnique({
    where: { phone: parsed.data.phone },
  });

  if (existing) {
    return res.status(409).json({
      error: 'Une candidature avec ce numéro de téléphone existe déjà. Votre dossier est en cours de traitement.',
    });
  }

  const candidate = await prisma.deliveryCandidate.create({
    data: parsed.data,
  });

  return res.status(201).json({
    message: 'Votre candidature a été soumise avec succès ! L\'équipe StatutShop vous contactera sous 48h.',
    candidate: {
      id: candidate.id,
      fullName: candidate.fullName,
      status: candidate.status,
    },
  });
}

export async function getDeliveryCandidates(req: Request, res: Response) {
  const { status } = req.query as { status?: string };

  const candidates = await prisma.deliveryCandidate.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ candidates });
}

export async function updateCandidateStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  const candidate = await prisma.deliveryCandidate.update({
    where: { id },
    data: { status },
  });

  return res.json({ candidate });
}
