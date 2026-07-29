import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/requireAdmin.middleware';
import { uploadDeliveryImages } from '../middlewares/upload.middleware';
import {
  submitDeliveryCandidate,
  getDeliveryCandidates,
  updateCandidateStatus,
} from '../controllers/deliveryCandidate.controller';

const router = Router();

// Route publique — soumission de candidature avec gestion des fichiers (avatar & photo CNI)
router.post(
  '/',
  uploadDeliveryImages.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cniPhoto', maxCount: 1 },
  ]),
  submitDeliveryCandidate
);

// Routes admin — consultation et traitement des candidatures
router.get('/', requireAuth, requireAdmin, getDeliveryCandidates);
router.put('/:id/status', requireAuth, requireAdmin, updateCandidateStatus);

export default router;
