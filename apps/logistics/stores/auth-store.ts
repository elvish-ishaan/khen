import { create } from 'zustand';
import { logisticsAuthApi, type DeliveryPersonnel } from '@/lib/api/auth.api';

interface AuthState {
  personnel: DeliveryPersonnel | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string, name?: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  personnel: null,
  isLoading: false,
  error: null,

  sendOtp: async (phone: string) => {
    try {
      set({ isLoading: true, error: null });
      await logisticsAuthApi.sendOtp({ phone });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send OTP',
        isLoading: false,
      });
      throw error;
    }
  },

  verifyOtp: async (phone: string, otp: string, name?: string, email?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await logisticsAuthApi.verifyOtp({ phone, otp, name, email });

      if (response.success && response.data) {
        set({
          personnel: response.data.personnel,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to verify OTP',
        isLoading: false,
      });
      throw error;
    }
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
    try {
      set({ isLoading: true });
      const response = await logisticsAuthApi.getMe();

      if (response.success && response.data) {
        set({
          personnel: response.data.personnel,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ personnel: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
