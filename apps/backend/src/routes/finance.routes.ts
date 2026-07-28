import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getFinanceSummary } from '../controllers/finance.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getFinanceSummary);

export default router;