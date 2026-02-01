import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  orderId: z.string().cuid(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().cuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
