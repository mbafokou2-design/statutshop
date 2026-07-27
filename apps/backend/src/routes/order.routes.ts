import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getOrders, updateOrderStatus } from '../controllers/order.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);

export default router;