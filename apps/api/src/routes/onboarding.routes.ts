import { Router } from 'express';
import {
  getStatusHandler,
  uploadDocumentsHandler,
  submitBankDetailsHandler,
  createRestaurantHandler,
  addCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  addMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
  updateLocationHandler,
  completeOnboardingHandler,
} from '../controllers/onboarding.controller';
import { authenticateRestaurant } from '../middleware/restaurant-auth';
import { uploadFields, uploadSingle, processAndUploadToGcs } from '../middleware/upload';

const router = Router();

// All onboarding routes require authentication
router.use(authenticateRestaurant);

// Get onboarding status
router.get('/status', getStatusHandler);

// Step 1: Upload documents
router.post(
  '/documents',
  uploadFields([
    { name: 'fssaiCertificate', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'gstin', maxCount: 1 },
  ]),
  processAndUploadToGcs('documents', { isPublic: false, optimize: false }),
  uploadDocumentsHandler
);

// Step 2: Bank details
router.post('/bank-details', submitBankDetailsHandler);

// Step 3: Restaurant info
router.post(
  '/restaurant',
  uploadSingle('coverImage'),
  processAndUploadToGcs('restaurants', { isPublic: true, optimize: true }),
  createRestaurantHandler
);

// Step 4: Menu management
router.post('/menu/categories', addCategoryHandler);
router.put('/menu/categories/:categoryId', updateCategoryHandler);
router.delete('/menu/categories/:categoryId', deleteCategoryHandler);

router.post(
  '/menu/items',
  uploadSingle('itemImage'),
  processAndUploadToGcs('menu-items', { isPublic: true, optimize: true }),
  addMenuItemHandler
);
router.put(
  '/menu/items/:itemId',
  uploadSingle('itemImage'),
  processAndUploadToGcs('menu-items', { isPublic: true, optimize: true }),
  updateMenuItemHandler
);
router.delete('/menu/items/:itemId', deleteMenuItemHandler);

// Step 5: Location
router.put('/location', updateLocationHandler);

// Complete onboarding
router.post('/complete', completeOnboardingHandler);

export default router;
