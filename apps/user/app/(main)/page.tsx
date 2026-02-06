'use client';

import { useEffect, useState } from 'react';
import { restaurantsApi, type Restaurant } from '@/lib/api/restaurants.api';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { useLocationStore } from '@/stores/location-store';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { coordinates, permissionGranted, requestLocation, error: locationError } = useLocationStore();

  // Auto-request location on mount if not already granted
  useEffect(() => {
    if (!coordinates && !permissionGranted && !locationError) {
      requestLocation();
    }
  }, []);

  // Fetch restaurants when coordinates change
  useEffect(() => {
    fetchRestaurants();
  }, [coordinates]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = coordinates
        ? {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }
        : {};

      const response = await restaurantsApi.getRestaurants(params);

      if (response.success && response.data) {
        setRestaurants(response.data.restaurants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Location Permission Denied Banner */}
      {locationError && !coordinates && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">
                Location permission denied
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                To see restaurants within 20km of you, please enable location access in your browser settings
              </p>
            </div>
            <button
              onClick={requestLocation}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 whitespace-nowrap ml-4"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Location Not Yet Granted Banner */}
      {!coordinates && !locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-900">
                Enable location to find nearby restaurants
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                We'll show you restaurants within 20km of your location
              </p>
            </div>
            <button
              onClick={requestLocation}
              className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Enable Location
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {coordinates ? 'Restaurants within 20km' : 'All Restaurants'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {coordinates
            ? 'Showing restaurants near your location'
            : 'Discover delicious food from restaurants'}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Restaurant Grid */}
      {!isLoading && !error && restaurants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && restaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <p className="text-gray-500 text-lg mb-2">
              {coordinates
                ? 'No restaurants accepting orders within 20km'
                : 'No restaurants accepting orders right now'}
            </p>
            <p className="text-gray-400 text-sm">
              Please check back later or try a different location
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
