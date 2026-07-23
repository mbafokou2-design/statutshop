import { Router } from 'express';
import {
  handleRequestOtp,
  handleVerifyOtp,
  handleRegister,
  handleLogin,
  handleLogout,
} from '../controllers/auth.controller';
import { otpRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/request-otp', otpRateLimiter, handleRequestOtp);
router.post('/verify-otp', handleVerifyOtp);
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);

export default router;