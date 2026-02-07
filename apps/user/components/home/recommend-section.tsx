'use client';

import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';
import type { Restaurant } from '@/lib/api/restaurants.api';
import { usersApi } from '@/lib/api/users.api';
import { useAuthStore } from '@/stores/auth-store';

interface RecommendSectionProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string;
}

export function RecommendSection({ restaurants, isLoading, error }: RecommendSectionProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommend</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommend</h2>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <p className="text-gray-500 mb-2">No restaurants available right now</p>
            <p className="text-gray-400 text-sm">Please check back later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recommend</h2>

      <div className="grid grid-cols-2 gap-4">
        {restaurants.map((restaurant) => (
          <RestaurantRecommendCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}

function RestaurantRecommendCard({ restaurant }: { restaurant: Restaurant }) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate discount badge (based on rating - just for visual purposes)
  const discountPercent = restaurant.rating >= 4.5 ? 60 : restaurant.rating >= 4 ? 40 : 20;

  return (
    <Link href={`/restaurant/${restaurant.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
        {/* Image with Discount Badge */}
        <div className="relative h-32 bg-gray-200">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400" />
          )}

          {/* Discount Badge */}
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <span className="text-[10px]">%</span>
            <span>{discountPercent}% OFF</span>
          </div>

          {/* Favorite Heart */}
          {isAuthenticated && (
            <button
              onClick={handleToggleFavorite}
              disabled={isUpdating}
              className={`absolute top-2 right-2 p-1.5 rounded-full shadow-lg transition-all ${
                isFavorite
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-400 hover:text-red-500'
              } disabled:opacity-50`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 mb-1">
            {restaurant.name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-gray-700">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({restaurant.totalReviews})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {restaurant.estimatedDeliveryTime} mins
            </div>
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ₹{restaurant.minOrderAmount}
            </div>
          </div>

          {restaurant.distance && (
            <div className="text-xs text-gray-500 mt-1">
              {restaurant.distance.toFixed(1)} km
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
