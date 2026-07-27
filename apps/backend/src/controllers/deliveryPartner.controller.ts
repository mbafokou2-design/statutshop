import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { listDeliveryPartnersQuerySchema, rateDeliveryPartnerSchema } from '../validators/deliveryPartner.validator';

// Sélection volontairement limitée : jamais de cniNumber ni cniPhotoUrl
// exposés aux vendeurs qui consultent l'annuaire.
const publicPartnerSelect = {
  id: true,
  fullName: true,
  whatsappNum: true,
  avatarUrl: true,
  city: true,
  coveredZones: true,
  vehicleType: true,
  basePrice: true,
  rating: true,
  totalDeliveries: true,
  isVerified: true,
};

export async function getDeliveryPartners(req: AuthRequest, res: Response) {
  const parsed = listDeliveryPartnersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { city, zone } = parsed.data;

  const partners = await prisma.deliveryPartner.findMany({
    where: {
      isVerified: true,
      isActive: true,
      ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
      ...(zone ? { coveredZones: { has: zone } } : {}),
    },
    select: publicPartnerSelect,
    orderBy: { rating: 'desc' },
  });

  return res.json({ partners });
}

export async function getDeliveryPartnerCities(req: AuthRequest, res: Response) {
  const partners = await prisma.deliveryPartner.findMany({
    where: { isVerified: true, isActive: true },
    select: { city: true },
    distinct: ['city'],
  });

  return res.json({ cities: partners.map((p) => p.city) });
}


export async function rateDeliveryPartner(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const vendeurId = req.user!.userId;

  const parsed = rateDeliveryPartnerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const partner = await prisma.deliveryPartner.findUnique({ where: { id } });
  if (!partner) {
    return res.status(404).json({ error: 'Livreur introuvable' });
  }

  await prisma.deliveryPartnerRating.upsert({
    where: { partnerId_vendeurId: { partnerId: id, vendeurId } },
    update: { rating: parsed.data.rating },
    create: { partnerId: id, vendeurId, rating: parsed.data.rating },
  });

  const agg = await prisma.deliveryPartnerRating.aggregate({
    where: { partnerId: id },
    _avg: { rating: true },
  });

  const updated = await prisma.deliveryPartner.update({
    where: { id },
    data: { rating: agg._avg.rating ?? 5 },
    select: publicPartnerSelect,
  });

  return res.json({ partner: updated });
}