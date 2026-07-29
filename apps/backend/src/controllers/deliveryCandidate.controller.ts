import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  whatsappNum: z.string().min(8, 'Numéro WhatsApp invalide'),
  city: z.string().min(1, 'La ville est requise'),
  coveredZones: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return val.split(',').map((z) => z.trim()).filter(Boolean);
      }
    }
    return [];
  }).default([]),
  vehicleType: z.enum(['MOTO', 'CAR', 'BICYCLE', 'WALKING']),
  basePrice: z.string().optional().nullable(),
  cniNumber: z.string().min(1, 'Le numéro CNI est requis'),
  avatarUrl: z.string().optional().nullable(),
  cniPhotoUrl: z.string().optional().nullable(),
  motivation: z.string().optional().nullable(),
});

export async function submitDeliveryCandidate(req: Request, res: Response) {
  // Extraire les fichiers Cloudinary si transmis via multipart/form-data
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const uploadedAvatar = files?.avatar?.[0]?.path;
  const uploadedCniPhoto = files?.cniPhoto?.[0]?.path;

  const parsed = createCandidateSchema.safeParse({
    ...req.body,
    avatarUrl: uploadedAvatar || req.body.avatarUrl || null,
    cniPhotoUrl: uploadedCniPhoto || req.body.cniPhotoUrl || null,
  });

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
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      whatsappNum: parsed.data.whatsappNum,
      city: parsed.data.city,
      coveredZones: parsed.data.coveredZones,
      vehicleType: parsed.data.vehicleType,
      basePrice: parsed.data.basePrice || null,
      cniNumber: parsed.data.cniNumber,
      avatarUrl: parsed.data.avatarUrl || null,
      cniPhotoUrl: parsed.data.cniPhotoUrl || null,
      motivation: parsed.data.motivation || null,
    },
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

  // Si le statut passe à APPROVED, on crée/certifie automatiquement le partenaire livreur
  if (status === 'APPROVED') {
    await prisma.deliveryPartner.upsert({
      where: { phone: candidate.phone },
      update: {
        fullName: candidate.fullName,
        whatsappNum: candidate.whatsappNum,
        avatarUrl: candidate.avatarUrl,
        cniNumber: candidate.cniNumber,
        cniPhotoUrl: candidate.cniPhotoUrl,
        city: candidate.city,
        coveredZones: candidate.coveredZones,
        vehicleType: candidate.vehicleType,
        basePrice: candidate.basePrice,
        motivation: candidate.motivation,
        isVerified: true,
        isActive: true,
      },
      create: {
        fullName: candidate.fullName,
        phone: candidate.phone,
        whatsappNum: candidate.whatsappNum,
        avatarUrl: candidate.avatarUrl,
        cniNumber: candidate.cniNumber,
        cniPhotoUrl: candidate.cniPhotoUrl,
        city: candidate.city,
        coveredZones: candidate.coveredZones,
        vehicleType: candidate.vehicleType,
        basePrice: candidate.basePrice,
        motivation: candidate.motivation,
        isVerified: true,
        isActive: true,
      },
    });
  }

  return res.json({ candidate });
}
