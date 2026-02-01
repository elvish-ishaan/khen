import { Router } from 'express';
import {
  sendOtpHandler,
  verifyOtpHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/logistics-auth.controller';
import { authenticateLogistics } from '../middleware/logistics-auth';

const router = Router();

// Public routes
router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);

// Protected routes
router.post('/logout', authenticateLogistics, logoutHandler);
router.get('/me', authenticateLogistics, getMeHandler);

export default router;
