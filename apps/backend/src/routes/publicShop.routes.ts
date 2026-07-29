import { Router } from 'express';
import { getPublicStore, getPublicProduct } from '../controllers/publicShop.controller';
import { createPublicOrder } from '../controllers/publicOrder.controller';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/:storeSlug', getPublicStore);
router.get('/:storeSlug/product/:productSlug', getPublicProduct);
router.post('/:storeSlug/orders', createPublicOrder);

// Compteur public de boutiques
router.get('/info/shops-count', async (req, res) => {
  try {
    const count = await prisma.user.count({ where: { role: 'VENDEUR' } });
    return res.json({ count });
  } catch {
    return res.json({ count: 1200 }); // fallback
  }
});

export default router;