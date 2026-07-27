import { Router } from 'express'; // <-- Import manquant ajouté ici
import {
  handleRequestOtp,
  handleVerifyOtp,
  handleRegister,
  handleLogin,
  handleLogout,
  handleChangePassword,
  getTelegramStatus,
  getMe,
} from '../controllers/auth.controller';
import { otpRateLimiter } from '../middlewares/rateLimit.middleware';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/request-otp', otpRateLimiter, handleRequestOtp);
router.post('/verify-otp', handleVerifyOtp);
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);

router.get('/me', requireAuth, getMe);

router.put('/change-password', requireAuth, handleChangePassword);
router.get('/telegram-status', requireAuth, getTelegramStatus);

export default router;

