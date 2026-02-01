import { Router } from 'express';
import {
  sendOtpHandler,
  verifyOtpHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/restaurant-auth.controller';
import { authenticateRestaurant } from '../middleware/restaurant-auth';
import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/send-otp', authLimiter, sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/logout', authenticateRestaurant, logoutHandler);
router.get('/me', authenticateRestaurant, getMeHandler);

export default router;
