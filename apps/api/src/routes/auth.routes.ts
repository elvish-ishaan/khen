import { Router } from 'express';
import {
  verifyFirebaseTokenHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/verify-token', verifyFirebaseTokenHandler);
router.post('/logout', authenticate, logoutHandler);
router.get('/me', authenticate, getMeHandler);

export default router;
