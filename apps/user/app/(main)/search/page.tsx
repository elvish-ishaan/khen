'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, ShoppingBag } from 'lucide-react';
import { restaurantsApi, type Restaurant } from '@/lib/api/restaurants.api';
import { useLocationStore } from '@/stores/location-store';
import Link from 'next/link';

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
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

  // Fetch search results when query or coordinates change
  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam, coordinates]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setRestaurants([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await restaurantsApi.searchRestaurants(
        query,
        coordinates?.latitude,
        coordinates?.longitude
      );

      if (response.success && response.data) {
        setRestaurants(response.data.restaurants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Update URL and trigger search
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 px-4 py-6 shadow-lg sticky top-16 z-40">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pl-4 pr-12 py-3 rounded-full text-sm bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Search Query Display */}
          {queryParam && (
            <p className="text-white mt-3 text-sm">
              Searching for: <span className="font-semibold">"{queryParam}"</span>
            </p>
          )}
        </div>
      </div>

      {/* Location Permission Banner */}
      {locationError && !coordinates && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-900 text-sm">
                  Location access needed
                </h3>
                <p className="text-xs text-amber-700 mt-1">
                  Enable location to find restaurants near you with your searched items
                </p>
              </div>
              <button
                onClick={requestLocation}
                className="bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700 text-xs whitespace-nowrap"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Results Count */}
        {!isLoading && queryParam && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {restaurants.length > 0 ? (
                <>
                  Found {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
                  {coordinates && ' near you'}
                </>
              ) : (
                'No results found'
              )}
            </h2>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-40 bg-gray-200" />
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Restaurant Results Grid */}
        {!isLoading && !error && restaurants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((restaurant) => (
              <RestaurantSearchCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && queryParam && restaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-yellow-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No restaurants found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any restaurants with "{queryParam}"
                {coordinates ? ' in your area' : ''}.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Try searching for:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Pizza', 'Burger', 'Biryani', 'Pasta', 'Dessert'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                      }}
                      className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <Link
                href="/"
                className="inline-block mt-6 bg-yellow-500 text-gray-900 px-6 py-3 rounded-full hover:bg-yellow-600 font-semibold transition-colors"
              >
                Browse All Restaurants
              </Link>
            </div>
          </div>
        )}

        {/* No Query State */}
        {!isLoading && !queryParam && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Start searching
              </h3>
              <p className="text-gray-600">
                Enter a dish name to find restaurants that serve it
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantSearchCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group border border-gray-100">
        {/* Restaurant Image */}
        <div className="relative h-40 bg-gray-200">
          {(restaurant.coverImageUrl || restaurant.imageUrl) ? (
            <img
              src={restaurant.coverImageUrl || restaurant.imageUrl || ''}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400" />
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {restaurant.name}
          </h3>

          {restaurant.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {restaurant.description}
            </p>
          )}

          {/* Cuisine Types */}
          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.cuisineType.slice(0, 2).map((cuisine) => (
              <span
                key={cuisine}
                className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium"
              >
                {cuisine}
              </span>
            ))}
            {restaurant.cuisineType.length > 2 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{restaurant.cuisineType.length - 2}
              </span>
            )}
          </div>

          {/* Rating and Delivery Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold text-gray-900">
                {restaurant.rating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({restaurant.totalReviews})
              </span>
            </div>

            {restaurant.estimatedDeliveryTime && (
              <div className="text-gray-600">
                {restaurant.estimatedDeliveryTime} mins
              </div>
            )}
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
