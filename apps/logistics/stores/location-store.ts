import { create } from 'zustand';
import { logisticsApi } from '@/lib/api/logistics.api';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isTracking: boolean;
  error: string | null;

  // Actions
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  clearError: () => void;
}

// Store watch ID and interval ID outside of Zustand state
let watchId: number | null = null;
let updateIntervalId: NodeJS.Timeout | null = null;

export const useLocationStore = create<LocationState>((set, get) => ({
  latitude: null,
  longitude: null,
  isTracking: false,
  error: null,

  updateLocation: async (latitude: number, longitude: number) => {
    try {
      set({ latitude, longitude, error: null });
      await logisticsApi.updateLocation({ latitude, longitude });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update location',
      });
      throw error;
    }
  },

  startTracking: async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      set({ error: 'Geolocation is not supported by your browser' });
      return;
    }

    // Clear any existing tracking
    get().stopTracking();

    set({ isTracking: true, error: null });

    // Get initial position immediately
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      await get().updateLocation(latitude, longitude);
    } catch (error) {
      const errorMessage = error instanceof GeolocationPositionError
        ? getGeolocationErrorMessage(error)
        : 'Failed to get initial location';
      set({ error: errorMessage, isTracking: false });
      return;
    }

    // Start watching position for real-time updates
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        set({ latitude, longitude, error: null });
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error);
        set({ error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Accept cached position up to 30 seconds old
      }
    );

    // Send location updates to backend every 30 seconds
    updateIntervalId = setInterval(async () => {
      const { latitude, longitude } = get();
      if (latitude !== null && longitude !== null) {
        try {
          await logisticsApi.updateLocation({ latitude, longitude });
        } catch (error) {
          console.error('Failed to send location update:', error);
          // Don't set error state here to avoid disrupting tracking
        }
      }
    }, 30000); // 30 seconds
  },

  stopTracking: () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    if (updateIntervalId !== null) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }

    set({ isTracking: false });
  },

  clearError: () => set({ error: null }),
}));

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied. Please enable location access.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information unavailable.';
    case error.TIMEOUT:
      return 'Location request timed out.';
    default:
      return 'Failed to get location.';
  }
}
