import { create } from 'zustand';
import { onboardingApi, type OnboardingStatus } from '@/lib/api/onboarding.api';

interface OnboardingState {
  status: OnboardingStatus | null;
  isLoading: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  clearError: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  status: null,
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await onboardingApi.getStatus();

      if (response.success && response.data) {
        set({
          status: response.data,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to fetch status',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
