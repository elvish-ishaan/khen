import { Router } from 'express';
import {
  submitDocumentsHandler,
  submitBankDetailsHandler,
  getOnboardingStatusHandler,
} from '../controllers/logistics-onboarding.controller';
import { authenticateLogistics } from '../middleware/logistics-auth';

const router = Router();

// All onboarding routes require authentication
router.use(authenticateLogistics);

router.post('/documents', submitDocumentsHandler);
router.post('/bank-details', submitBankDetailsHandler);
router.get('/status', getOnboardingStatusHandler);

export default router;
