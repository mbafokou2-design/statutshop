import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getDeliveryPartners, getDeliveryPartnerCities, rateDeliveryPartner } from '../controllers/deliveryPartner.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getDeliveryPartners);
router.get('/cities', getDeliveryPartnerCities);
router.post('/:id/rate', rateDeliveryPartner);

export default router;