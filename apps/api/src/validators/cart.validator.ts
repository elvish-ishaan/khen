import { z } from 'zod';

export const addToCartSchema = z.object({
  restaurantId: z.string().cuid(),
  menuItemId: z.string().cuid(),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
