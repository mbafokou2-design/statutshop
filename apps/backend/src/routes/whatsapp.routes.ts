import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsAppHandler,
  sendRelance,
  checkContactEligibility,
} from '../controllers/whatsapp.controller';

const router = Router();

router.use(requireAuth);
router.post('/connect', connectWhatsApp);
router.get('/status', getWhatsAppStatus);
router.post('/disconnect', disconnectWhatsAppHandler);
router.post('/relance', sendRelance);
router.get('/eligibility/:phone', checkContactEligibility);

export default router;