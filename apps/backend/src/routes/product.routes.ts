import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { uploadProductImage } from '../middlewares/upload.middleware';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';

const router = Router();

router.use(requireAuth); // toutes les routes ci-dessous exigent un token valide

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', uploadProductImage.single('image'), createProduct);
router.put('/:id', uploadProductImage.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;