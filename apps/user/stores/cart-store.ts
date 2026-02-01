import { create } from 'zustand';
import { cartApi, type Cart } from '@/lib/api/cart.api';

interface CartState {
  cart: Cart | null;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (restaurantId: string, menuItemId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await cartApi.getCart();

      if (response.success) {
        set({
          cart: response.data?.cart || null,
          subtotal: response.data?.subtotal || 0,
          itemCount: response.data?.itemCount || 0,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cart',
        isLoading: false,
      });
    }
  },

  addToCart: async (restaurantId, menuItemId, quantity) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cartApi.addToCart({
        restaurantId,
        menuItemId,
        quantity,
      });

      if (response.success) {
        // Refresh cart
        await get().fetchCart();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add item to cart',
        isLoading: false,
      });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cartApi.updateCartItem(itemId, { quantity });

      if (response.success) {
        // Refresh cart
        await get().fetchCart();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update quantity',
        isLoading: false,
      });
    }
  },

  removeItem: async (itemId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cartApi.removeCartItem(itemId);

      if (response.success) {
        // Refresh cart
        await get().fetchCart();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove item',
        isLoading: false,
      });
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await cartApi.clearCart();

      if (response.success) {
        set({
          cart: null,
          subtotal: 0,
          itemCount: 0,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
