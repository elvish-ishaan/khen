import { Router } from 'express';
import {
  submitDocumentsHandler,
  submitBankDetailsHandler,
  getOnboardingStatusHandler,
} from '../controllers/logistics-onboarding.controller';
import { authenticateLogistics } from '../middleware/logistics-auth';
import { uploadFields, processAndUploadToGcs } from '../middleware/upload';

const router = Router();

// All onboarding routes require authentication
router.use(authenticateLogistics);

router.post(
  '/documents',
  uploadFields([
    { name: 'aadharFile', maxCount: 1 },
    { name: 'dlFile', maxCount: 1 },
  ]),
  processAndUploadToGcs('documents', { isPublic: false, optimize: false }),
  submitDocumentsHandler
);
router.post('/bank-details', submitBankDetailsHandler);
router.get('/status', getOnboardingStatusHandler);

export default router;
