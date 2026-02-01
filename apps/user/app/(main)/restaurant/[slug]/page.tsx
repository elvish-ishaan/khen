'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { restaurantsApi, type RestaurantDetail } from '@/lib/api/restaurants.api';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchRestaurant();
  }, [slug]);

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await restaurantsApi.getRestaurantBySlug(slug);

      if (response.success && response.data) {
        setRestaurant(response.data.restaurant);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (menuItemId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/restaurant/${slug}`);
      return;
    }

    if (!restaurant) return;

    try {
      await addToCart(restaurant.id, menuItemId, 1);
      // Show success message (you can add a toast notification here)
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Restaurant not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Restaurant Header */}
      {restaurant.coverImageUrl && (
        <div className="relative h-64 rounded-lg overflow-hidden mb-6">
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {restaurant.name}
        </h1>

        {restaurant.description && (
          <p className="text-gray-600 mb-4">{restaurant.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.cuisineType.map((cuisine) => (
            <span
              key={cuisine}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {cuisine}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="font-semibold">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({restaurant.totalReviews} reviews)
            </span>
          </div>

          <div className="text-gray-600">
            {restaurant.estimatedDeliveryTime} mins
          </div>

          <div className="text-gray-600">
            Min order ₹{restaurant.minOrderAmount}
          </div>

          <div className="text-gray-600">
            Delivery ₹{restaurant.deliveryFee}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Open: {restaurant.opensAt} - {restaurant.closesAt}
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-8">
        {restaurant.categories.map((category) => (
          <div key={category.id}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {category.name}
            </h2>

            {category.description && (
              <p className="text-gray-600 mb-4">{category.description}</p>
            )}

            <div className="grid gap-4">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 flex gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.isVeg
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-red-100 text-red-700 border border-red-300'
                        }`}
                      >
                        {item.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                    )}

                    <p className="text-lg font-bold text-gray-900">
                      ₹{item.price}
                    </p>
                  </div>

                  {item.imageUrl && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-end">
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      disabled={!item.isAvailable}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                    >
                      {item.isAvailable ? 'Add' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
