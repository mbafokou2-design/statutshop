import { Router } from 'express';
import { trackShopVisit } from '../controllers/shop.controller';
import { getGlobalAnalytics } from '../services/analytics.service';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Route publique pour compter une visite sur la boutique d'un vendeur
router.post('/shop/:slug/visit', trackShopVisit);

// Route réservée au futur Super Admin pour récupérer les stats Google Analytics
router.get('/admin/analytics', requireAuth, async (req, res) => {
  try {
    const data = await getGlobalAnalytics();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erreur Analytics' });
  }
});

export default router;