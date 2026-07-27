import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createPublicOrderSchema } from '../validators/publicOrder.validator';

export async function createPublicOrder(req: Request, res: Response) {
  const { storeSlug } = req.params;

  const parsed = createPublicOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { productId, customerName, customerPhone, deliveryAddress, quantity } = parsed.data;

  const vendeur = await prisma.user.findUnique({ where: { storeSlug } });
  if (!vendeur) {
    return res.status(404).json({ error: 'Boutique introuvable' });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, vendeurId: vendeur.id, isActive: true, isAvailable: true },
  });

  if (!product) {
    return res.status(404).json({ error: 'Produit indisponible' });
  }

  const totalAmount = Number(product.priceSelling) * quantity;

  const order = await prisma.order.create({
    data: {
      vendeurId: vendeur.id,
      customerName,
      customerPhone,
      deliveryAddress,
      totalAmount,
      items: {
        create: [{ productId: product.id, quantity, unitPrice: product.priceSelling }],
      },
    },
    include: { items: true },
  });

  return res.status(201).json({ order });
}