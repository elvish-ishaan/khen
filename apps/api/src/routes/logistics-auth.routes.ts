import { Router } from 'express';
import {
  verifyFirebaseTokenHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/logistics-auth.controller';
import { authenticateLogistics } from '../middleware/logistics-auth';

const router = Router();

// Public routes
router.post('/verify-token', verifyFirebaseTokenHandler);

// Protected routes
router.post('/logout', authenticateLogistics, logoutHandler);
router.get('/me', authenticateLogistics, getMeHandler);

export default router;
