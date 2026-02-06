'use client';

import { useEffect, useState } from 'react';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { usersApi } from '@/lib/api/users.api';
import type { Restaurant } from '@/lib/api/restaurants.api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await usersApi.getFavorites();

      if (response.success && response.data) {
        // Extract restaurant objects from the favorites
        const restaurantList = response.data.favorites.map((fav) => fav.restaurant);
        setFavorites(restaurantList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: string) => {
    try {
      await usersApi.removeFavorite(restaurantId);
      // Refresh favorites list
      await fetchFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
        Favorite Restaurants
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-8 sm:py-16 bg-white rounded-lg shadow-md px-4">
          <p className="text-gray-500 text-base sm:text-lg mb-3 sm:mb-4">
            No favorite restaurants yet
          </p>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Start adding your favorite restaurants to see them here
          </p>
          <a
            href="/"
            className="inline-block bg-yellow-500 text-gray-900 px-6 py-3 rounded-md hover:bg-yellow-600 font-medium"
          >
            Browse Restaurants
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isFavorite={true}
              onToggleFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
