import { create } from 'zustand';
import { logisticsAuthApi, type DeliveryPersonnel } from '@/lib/api/auth.api';

interface AuthState {
  personnel: DeliveryPersonnel | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPersonnel: (personnel: DeliveryPersonnel | null) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  personnel: null,
  isLoading: false,
  error: null,

  setPersonnel: (personnel: DeliveryPersonnel | null) => {
    set({ personnel });
  },

  logout: async () => {
    try {
      await logisticsAuthApi.logout();
      set({ personnel: null, isLoading: false, error: null });
      // Redirect to login page after successful logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: 'Logout failed', isLoading: false });
    }
  },

  fetchMe: async () => {
    // Prevent concurrent requests
    const currentState = get();
    if (currentState.isLoading) {
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const response = await logisticsAuthApi.getMe();

      if (response.success && response.data) {
        set({
          personnel: response.data.personnel,
          isLoading: false,
        });
      } else {
        set({ personnel: null, isLoading: false });
      }
    } catch (error) {
      set({ personnel: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
