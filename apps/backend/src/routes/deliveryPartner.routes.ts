import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getDeliveryPartners, getDeliveryPartnerCities } from '../controllers/deliveryPartner.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getDeliveryPartners);
router.get('/cities', getDeliveryPartnerCities);

export default router;