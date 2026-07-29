import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireVendeur } from '../middlewares/requireVendeur.middleware';
import { getFinanceSummary } from '../controllers/finance.controller';

const router = Router();

router.use(requireAuth, requireVendeur);
router.get('/', getFinanceSummary);

export default router;