import { Router } from 'express';
import {
  getAddressesHandler,
  createAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler,
} from '../controllers/address.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', getAddressesHandler);
router.post('/', createAddressHandler);
router.patch('/:id', updateAddressHandler);
router.delete('/:id', deleteAddressHandler);
router.post('/:id/default', setDefaultAddressHandler);

export default router;
