import { create } from 'zustand';
import { logisticsApi } from '@/lib/api/logistics.api';

interface Delivery {
  id: string;
  orderId: string;
  status: string;
  distance: number;
  earnings: number;
  order: any;
}

interface DeliveryState {
  activeDeliveries: Delivery[];
  isLoading: boolean;
  error: string | null;
  isOnDuty: boolean;

  // Actions
  startDuty: () => Promise<void>;
  endDuty: () => Promise<void>;
  initializeDutyStatus: (isOnDuty: boolean) => void;
  fetchActiveDeliveries: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  markPickedUp: (deliveryId: string) => Promise<void>;
  markDelivered: (deliveryId: string) => Promise<void>;
  clearError: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  activeDeliveries: [],
  isLoading: false,
  error: null,
  isOnDuty: false,

  startDuty: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await logisticsApi.startDuty();

      if (response.success) {
        set({ isOnDuty: true, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start duty',
        isLoading: false,
      });
      throw error;
    }
  },

  endDuty: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await logisticsApi.endDuty();

      if (response.success) {
        set({ isOnDuty: false, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to end duty',
        isLoading: false,
      });
      throw error;
    }
  },

  initializeDutyStatus: (isOnDuty: boolean) => {
    set({ isOnDuty });
  },

  fetchActiveDeliveries: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await logisticsApi.getActiveDeliveries();

      if (response.success && response.data) {
        set({
          //@ts-ignore
          activeDeliveries: response.data?.deliveries,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch deliveries',
        isLoading: false,
      });
    }
  },

  acceptOrder: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await logisticsApi.acceptOrder({ orderId });

      if (response.success) {
        // Refresh active deliveries
        await get().fetchActiveDeliveries();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to accept order',
        isLoading: false,
      });
      throw error;
    }
  },

  markPickedUp: async (deliveryId: string) => {
    try {
      set({ isLoading: true, error: null });
      await logisticsApi.markPickedUp(deliveryId);

      // Refresh active deliveries
      await get().fetchActiveDeliveries();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark as picked up',
        isLoading: false,
      });
      throw error;
    }
  },

  markDelivered: async (deliveryId: string) => {
    try {
      set({ isLoading: true, error: null });
      await logisticsApi.markDelivered(deliveryId);

      // Refresh active deliveries
      await get().fetchActiveDeliveries();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark as delivered',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
