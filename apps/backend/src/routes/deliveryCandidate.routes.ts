import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/requireAdmin.middleware';
import {
  submitDeliveryCandidate,
  getDeliveryCandidates,
  updateCandidateStatus,
} from '../controllers/deliveryCandidate.controller';

const router = Router();

// Route publique — soumission de candidature (aucune auth requise)
router.post('/', submitDeliveryCandidate);

// Routes admin — consultation et traitement des candidatures
router.get('/', requireAuth, requireAdmin, getDeliveryCandidates);
router.put('/:id/status', requireAuth, requireAdmin, updateCandidateStatus);

export default router;
