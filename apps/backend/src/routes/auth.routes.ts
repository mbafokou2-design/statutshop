import { Router } from 'express';
import {
  handleRequestOtp,
  handleVerifyOtp,
  handleRegister,
  handleLogin,
  handleLogout,
  handleResetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/request-otp', handleRequestOtp);
router.post('/verify-otp', handleVerifyOtp);
router.post('/reset-password', handleResetPassword);
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);

export default router;