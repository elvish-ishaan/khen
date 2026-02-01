import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coordinates: LocationCoordinates | null;
  address: string | null;
  permissionGranted: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  requestLocation: () => Promise<void>;
  setCoordinates: (coords: LocationCoordinates) => void;
  setAddress: (address: string) => void;
  clearLocation: () => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coordinates: null,
      address: null,
      permissionGranted: false,
      isLoading: false,
      error: null,

      requestLocation: async () => {
        if (!navigator.geolocation) {
          set({ error: 'Geolocation is not supported by your browser' });
          return;
        }

        set({ isLoading: true, error: null });

        navigator.geolocation.getCurrentPosition(
          (position) => {
            set({
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              permissionGranted: true,
              isLoading: false,
            });
          },
          (error) => {
            let errorMessage = 'Failed to get location';

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }

            set({
              error: errorMessage,
              permissionGranted: false,
              isLoading: false,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      },

      setCoordinates: (coords) => {
        set({ coordinates: coords, permissionGranted: true });
      },

      setAddress: (address) => {
        set({ address });
      },

      clearLocation: () => {
        set({
          coordinates: null,
          address: null,
          permissionGranted: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        coordinates: state.coordinates,
        address: state.address,
      }),
    }
  )
);
