import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { updateShopStatusSchema, createAdminDeliveryPartnerSchema } from '../validators/admin.validator';

export async function getAdminOverview(req: AuthRequest, res: Response) {
  const [shopsCount, activeShopsCount, ordersCount, revenueAgg, deliveryPartnersCount, certifiedCount] =
    await Promise.all([
      prisma.user.count({ where: { role: 'VENDEUR' } }),
      prisma.user.count({ where: { role: 'VENDEUR', isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.deliveryPartner.count(),
      prisma.deliveryPartner.count({ where: { isVerified: true } }),
    ]);

  return res.json({
    totalShops: shopsCount,
    activeShops: activeShopsCount,
    suspendedShops: shopsCount - activeShopsCount,
    totalOrders: ordersCount,
    totalRevenue: Number(revenueAgg._sum.totalAmount || 0),
    totalDeliveryPartners: deliveryPartnersCount,
    certifiedDeliveryPartners: certifiedCount,
  });
}

export async function getAllShops(req: AuthRequest, res: Response) {
  const { search, city } = req.query as { search?: string; city?: string };

  const shops = await prisma.user.findMany({
    where: {
      role: 'VENDEUR',
      ...(city && city !== 'all' ? { city: { equals: city, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { storeName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    select: {
      id: true, storeName: true, storeSlug: true, phone: true, city: true, neighborhood: true,
      isActive: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ajoute le CA livré par boutique
  const shopsWithRevenue = await Promise.all(
    shops.map(async (shop) => {
      const revenueAgg = await prisma.order.aggregate({
        where: { vendeurId: shop.id, status: 'DELIVERED' },
        _sum: { totalAmount: true },
      });
      return {
        ...shop,
        ordersCount: shop._count.orders,
        totalRevenue: Number(revenueAgg._sum.totalAmount || 0),
      };
    })
  );

  return res.json({ shops: shopsWithRevenue });
}

export async function updateShopStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const parsed = updateShopStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const shop = await prisma.user.update({
    where: { id },
    data: { isActive: parsed.data.isActive },
  });

  return res.json({ shop });
}

export async function deleteShop(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  return res.json({ message: 'Boutique supprimée' });
}

export async function getAllDeliveryPartnersAdmin(req: AuthRequest, res: Response) {
  const partners = await prisma.deliveryPartner.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ partners });
}

export async function createDeliveryPartnerAdmin(req: AuthRequest, res: Response) {
  const parsed = createAdminDeliveryPartnerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const partner = await prisma.deliveryPartner.create({ data: parsed.data });
  return res.status(201).json({ partner });
}

export async function toggleDeliveryPartnerCertification(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const partner = await prisma.deliveryPartner.findUnique({ where: { id } });
  if (!partner) return res.status(404).json({ error: 'Livreur introuvable' });

  const updated = await prisma.deliveryPartner.update({
    where: { id },
    data: { isVerified: !partner.isVerified },
  });

  return res.json({ partner: updated });
}

export async function deleteDeliveryPartnerAdmin(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await prisma.deliveryPartner.delete({ where: { id } });
  return res.json({ message: 'Livreur supprimé' });
}