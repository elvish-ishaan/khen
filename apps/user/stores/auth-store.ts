import { create } from 'zustand';
import { authApi, type User } from '@/lib/api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.getMe();

      if (response.success && response.data?.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
