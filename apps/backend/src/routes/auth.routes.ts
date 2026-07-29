import { Router } from 'express';
import {
  handleRequestOtp,
  handleVerifyOtp,
  handleRegister,
  handleLogin,
  handleLogout,
  handleChangePassword,
  handleResetPassword, 
  getTelegramStatus,
  getWhatsAppStatus,
  getMe,
} from '../controllers/auth.controller';
import { otpRateLimiter } from '../middlewares/rateLimit.middleware';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Routes publiques (Authentification & Réinitialisation)
router.post('/request-otp', otpRateLimiter, handleRequestOtp);
router.post('/verify-otp', handleVerifyOtp);
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);
router.post('/reset-password', handleResetPassword); // 👈 2. Route ajoutée ici !

// Routes protégées (Nécessitent un utilisateur connecté)
router.get('/me', requireAuth, getMe);
router.put('/change-password', requireAuth, handleChangePassword);
router.get('/telegram-status', requireAuth, getTelegramStatus);
router.get('/whatsapp-status', requireAuth, getWhatsAppStatus);

export default router;
