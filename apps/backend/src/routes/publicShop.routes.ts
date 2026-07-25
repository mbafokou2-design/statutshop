import { Router } from 'express';
import { getPublicStore, getPublicProduct } from '../controllers/publicShop.controller';

const router = Router();

router.get('/:storeSlug', getPublicStore);
router.get('/:storeSlug/product/:productSlug', getPublicProduct);

export default router;