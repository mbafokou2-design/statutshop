import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { updateOrderStatusSchema, listOrdersQuerySchema } from '../validators/order.validator';

export async function getOrders(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const parsed = listOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const orders = await prisma.order.findMany({
    where: { vendeurId, ...(parsed.data.status ? { status: parsed.data.status } : {}) },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ orders });
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const { id } = req.params;

  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const existing = await prisma.order.findFirst({
    where: { id, vendeurId },
    include: { items: true },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }

  const { status } = parsed.data;

  // Décrémente le stock uniquement au passage à DELIVERED, et une seule fois
  if (status === 'DELIVERED' && existing.status !== 'DELIVERED') {
    await prisma.$transaction(
      existing.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        })
      )
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: { include: { product: true } } },
  });

  return res.json({ order });
}