import { Router } from 'express';
import { getPublicStore, getPublicProduct } from '../controllers/publicShop.controller';
import { createPublicOrder } from '../controllers/publicOrder.controller';
import { prisma } from '../lib/prisma';

const router = Router();

// Compteur public de boutiques (DOIT être déclaré avant /:storeSlug)
router.get('/info/shops-count', async (req, res) => {
  try {
    const count = await prisma.user.count({ where: { role: 'VENDEUR' } });
    return res.json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage des boutiques:', error);
    return res.json({ count: 0 });
  }
});

router.get('/:storeSlug', getPublicStore);
router.get('/:storeSlug/product/:productSlug', getPublicProduct);
router.post('/:storeSlug/orders', createPublicOrder);

export default router;