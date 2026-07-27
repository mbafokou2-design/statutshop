import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const vendeurPublicSelect = {
  id: true, storeName: true, storeSlug: true, whatsappBusinessNum: true,
  city: true, neighborhood: true, logoUrl: true, coverUrl: true, description: true,
};

export async function getPublicStore(req: Request, res: Response) {
  const { storeSlug } = req.params;

  const vendeur = await prisma.user.findUnique({
    where: { storeSlug },
    select: vendeurPublicSelect,
  });

  if (!vendeur) {
    return res.status(404).json({ error: 'Boutique introuvable' });
  }

  const products = await prisma.product.findMany({
    where: { vendeurId: vendeur.id, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ vendeur, products });
}

export async function getPublicProduct(req: Request, res: Response) {
  const { storeSlug, productSlug } = req.params;

  const vendeur = await prisma.user.findUnique({ where: { storeSlug }, select: vendeurPublicSelect });
  if (!vendeur) {
    return res.status(404).json({ error: 'Boutique introuvable' });
  }

  const product = await prisma.product.findFirst({
    where: { vendeurId: vendeur.id, slug: productSlug, isActive: true },
  });

  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  return res.json({ vendeur, product });
}