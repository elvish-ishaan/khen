import { Router } from 'express';
import { testCookieHandler, checkCookieHandler } from '../controllers/test.controller';

const router = Router();

/**
 * Test routes for debugging cookie issues
 * DELETE THIS FILE after debugging
 */

// Set a test cookie
router.get('/set-cookie', testCookieHandler);

// Check if cookies are received
router.get('/check-cookie', checkCookieHandler);

export default router;
