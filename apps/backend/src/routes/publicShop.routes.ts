import { Router } from 'express';
import { getPublicStore, getPublicProduct } from '../controllers/publicShop.controller';
import { createPublicOrder } from '../controllers/publicOrder.controller';

const router = Router();

router.get('/:storeSlug', getPublicStore);
router.get('/:storeSlug/product/:productSlug', getPublicProduct);
router.post('/:storeSlug/orders', createPublicOrder);

export default router;