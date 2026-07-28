import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { financeQuerySchema } from '../validators/finance.validator';

function getStartDate(period: 'today' | 'week' | 'month'): Date {
  const now = new Date();
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d;
}

export async function getFinanceSummary(req: AuthRequest, res: Response) {
  const parsed = financeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const vendeurId = req.user!.userId;
  const startDate = getStartDate(parsed.data.period);

  const orders = await prisma.order.findMany({
    where: {
      vendeurId,
      status: 'DELIVERED',
      createdAt: { gte: startDate },
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  let totalCA = 0;
  let totalWholesale = 0;
  let totalDeliveryFees = 0;

  const ledger = orders.map((order) => {
    const orderCA = Number(order.totalAmount);
    const orderWholesale = order.items.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.priceWholesale),
      0
    );
    const deliveryFee = Number(order.deliveryFee);
    const netProfit = orderCA - orderWholesale - deliveryFee;

    totalCA += orderCA;
    totalWholesale += orderWholesale;
    totalDeliveryFees += deliveryFee;

    return {
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      customerName: order.customerName,
      productTitle: order.items[0]?.product.title || '',
      totalAmount: orderCA,
      wholesaleCost: orderWholesale,
      deliveryFee,
      netProfit,
      createdAt: order.createdAt,
    };
  });

  const netProfitInPocket = totalCA - totalWholesale - totalDeliveryFees;
  const profitMarginPercent = totalCA > 0 ? Math.round((netProfitInPocket / totalCA) * 100) : 0;

  return res.json({
    period: parsed.data.period,
    totalCA,
    totalWholesale,
    totalDeliveryFees,
    netProfitInPocket,
    profitMarginPercent,
    deliveredOrdersCount: orders.length,
    ledger,
  });
}