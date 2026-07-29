import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/requireAdmin.middleware';
import {
  getAdminOverview,
  getAllShops,
  updateShopStatus,
  deleteShop,
  getAllDeliveryPartnersAdmin,
  createDeliveryPartnerAdmin,
  toggleDeliveryPartnerCertification,
  deleteDeliveryPartnerAdmin,
} from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/overview', getAdminOverview);

router.get('/shops', getAllShops);
router.put('/shops/:id/status', updateShopStatus);
router.delete('/shops/:id', deleteShop);

router.get('/delivery-partners', getAllDeliveryPartnersAdmin);
router.post('/delivery-partners', createDeliveryPartnerAdmin);
router.put('/delivery-partners/:id/toggle-certification', toggleDeliveryPartnerCertification);
router.delete('/delivery-partners/:id', deleteDeliveryPartnerAdmin);

export default router;