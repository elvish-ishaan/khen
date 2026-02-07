'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Plus } from 'lucide-react';
import { restaurantsApi, type RestaurantDetail } from '@/lib/api/restaurants.api';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { ReviewsList } from '@/components/restaurant/reviews-list';

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

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
      setAddingToCart(menuItemId);
      await addToCart(restaurant.id, menuItemId, 1);
      // Success - item added
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
          {error || 'Restaurant not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Restaurant Cover Image */}
      {restaurant.coverImageUrl && (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-lg -mt-8 relative z-10 p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {restaurant.name}
          </h1>

          {restaurant.description && (
            <p className="text-gray-600 mb-4">{restaurant.description}</p>
          )}

          {/* Cuisine Types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.cuisineType.map((cuisine) => (
              <span
                key={cuisine}
                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {cuisine}
              </span>
            ))}
          </div>

          {/* Rating Only */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-bold text-gray-900">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500">
              ({restaurant.totalReviews} {restaurant.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="space-y-8">
          {restaurant.categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 text-sm">{category.description}</p>
                )}
              </div>

              {/* Menu Items Grid */}
              <div className="grid gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100"
                  >
                    <div className="flex gap-4">
                      {/* Item Details */}
                      <div className="flex-1">
                        {/* Veg/Non-Veg Badge */}
                        <div className="mb-2">
                          <span
                            className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                              item.isVeg
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-red-100 text-red-700 border border-red-300'
                            }`}
                          >
                            <span className="mr-1">{item.isVeg ? '●' : '▲'}</span>
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>

                        {/* Item Name */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>

                        {/* Item Description */}
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* Price and Add Button */}
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-xl font-bold text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </p>

                          <button
                            onClick={() => handleAddToCart(item.id)}
                            disabled={!item.isAvailable || addingToCart === item.id}
                            className="bg-yellow-500 text-gray-900 px-5 py-2 rounded-full hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm transition-all hover:scale-105 flex items-center gap-1 shadow-md"
                          >
                            {addingToCart === item.id ? (
                              'Adding...'
                            ) : item.isAvailable ? (
                              <>
                                <Plus className="w-4 h-4" />
                                Add
                              </>
                            ) : (
                              'Unavailable'
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Item Image */}
                      {item.imageUrl && (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Improved Reviews Section */}
        <div className="mt-12">
          {/* Reviews Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
                <p className="text-white/90">See what people are saying</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-6 h-6 text-white fill-white" />
                  <span className="text-3xl font-bold">{restaurant.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-white/90">
                  {restaurant.totalReviews} {restaurant.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Content */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6">
            <ReviewsList
              restaurantId={restaurant.id}
              averageRating={restaurant.rating}
              totalReviews={restaurant.totalReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
