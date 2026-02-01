import { z } from 'zod';
import { PaymentMethod } from '@repo/db';

export const createOrderSchema = z.object({
  addressId: z.string().cuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryInstructions: z.string().optional(),
});

export const reorderSchema = z.object({
  addressId: z.string().cuid().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
