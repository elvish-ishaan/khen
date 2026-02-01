import { create } from 'zustand';
import { authApi, type RestaurantOwner } from '@/lib/api/auth.api';

interface AuthState {
  owner: RestaurantOwner | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setOwner: (owner: RestaurantOwner | null) => void;
  fetchOwner: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  owner: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setOwner: (owner) =>
    set({
      owner,
      isAuthenticated: !!owner,
      error: null,
    }),

  fetchOwner: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.getMe();

      if (response.success && response.data) {
        set({
          owner: response.data.owner,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          owner: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.error || 'Failed to fetch owner',
        });
      }
    } catch (error) {
      set({
        owner: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch owner',
      });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      set({
        owner: null,
        isAuthenticated: false,
        error: null,
      });
      window.location.href = '/login';
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
