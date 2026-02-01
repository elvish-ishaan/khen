import { Router } from 'express';
import {
  sendOtpHandler,
  verifyOtpHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/send-otp', authLimiter, sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/logout', authenticate, logoutHandler);
router.get('/me', authenticate, getMeHandler);

export default router;
