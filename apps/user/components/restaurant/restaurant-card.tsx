'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import type { Restaurant } from '@/lib/api/restaurants.api';
import { usersApi } from '@/lib/api/users.api';
import { useAuthStore } from '@/stores/auth-store';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
}

export function RestaurantCard({ restaurant, isFavorite: initialFavorite = false, onToggleFavorite }: RestaurantCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    if (!isAuthenticated) return;

    setIsUpdating(true);
    try {
      if (isFavorite) {
        await usersApi.removeFavorite(restaurant.id);
        setIsFavorite(false);
      } else {
        await usersApi.addFavorite(restaurant.id);
        setIsFavorite(true);
      }

      // Call parent callback if provided
      if (onToggleFavorite) {
        onToggleFavorite(restaurant.id);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link href={`/restaurant/${restaurant.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all hover:border-yellow-500 hover:border-2 border-2 border-transparent">
        {restaurant.imageUrl && (
          <div className="relative h-48 bg-gray-200">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />

            {/* Favorite Heart Icon */}
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                disabled={isUpdating}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all ${
                  isFavorite
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-white text-gray-400 hover:text-red-500 hover:bg-gray-50'
                } disabled:opacity-50`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
                />
              </button>
            )}
          </div>
        )}

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {restaurant.name}
          </h3>

          {restaurant.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {restaurant.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.cuisineType.slice(0, 3).map((cuisine) => (
              <span
                key={cuisine}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {cuisine}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">
                {restaurant.rating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({restaurant.totalReviews})
              </span>
            </div>

            <div className="text-gray-600">
              {restaurant.estimatedDeliveryTime} mins
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
            <div className="text-gray-600">
              Min ₹{restaurant.minOrderAmount}
            </div>
            <div className="text-gray-600">
              Delivery ₹{restaurant.deliveryFee}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
            {restaurant.totalCompletedOrders}{' '}
            {restaurant.totalCompletedOrders === 1 ? 'order' : 'orders'}{' '}
            completed
          </div>

          {restaurant.distance && (
            <div className="text-xs text-gray-500 mt-2">
              {restaurant.distance.toFixed(1)} km away
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
