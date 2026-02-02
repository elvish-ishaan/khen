import { z } from 'zod';

export const calculateDeliveryFeeSchema = z.object({
  addressId: z.string().cuid('Invalid address ID format'),
});
