import { apiClient } from './client';
import type { MenuItem, Restaurant } from './restaurants.api';

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  menuItem: MenuItem;
}

export interface Cart {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: Pick<
    Restaurant,
    'id' | 'slug' | 'name' | 'imageUrl' | 'deliveryFee' | 'minOrderAmount' | 'estimatedDeliveryTime'
  >;
  items: CartItem[];
}

export interface AddToCartRequest {
  restaurantId: string;
  menuItemId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CalculateDeliveryFeeRequest {
  addressId: string;
}

export interface CalculateDeliveryFeeResponse {
  deliveryFee: number;
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
}

export const cartApi = {
  getCart: () => {
    return apiClient.get<{
      cart: Cart | null;
      subtotal: number;
      itemCount: number;
    }>('/cart');
  },

  addToCart: (data: AddToCartRequest) => {
    return apiClient.post<{ cartItem: CartItem }>('/cart/items', data);
  },

  updateCartItem: (itemId: string, data: UpdateCartItemRequest) => {
    return apiClient.patch<{ cartItem: CartItem }>(`/cart/items/${itemId}`, data);
  },

  removeCartItem: (itemId: string) => {
    return apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: () => {
    return apiClient.delete('/cart');
  },

  calculateDeliveryFee: (data: CalculateDeliveryFeeRequest) => {
    return apiClient.post<CalculateDeliveryFeeResponse>('/delivery/calculate-fee', data);
  },
};
