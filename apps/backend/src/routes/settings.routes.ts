import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireVendeur } from '../middlewares/requireVendeur.middleware';
import { uploadProductImage } from '../middlewares/upload.middleware';
import { getSettings, updateSettings } from '../controllers/settings.controller';

const router = Router();

router.use(requireAuth, requireVendeur);
router.get('/', getSettings);
router.put('/', uploadProductImage.single('image'), updateSettings);

export default router;