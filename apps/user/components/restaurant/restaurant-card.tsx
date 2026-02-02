import Link from 'next/link';
import type { Restaurant } from '@/lib/api/restaurants.api';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {restaurant.imageUrl && (
          <div className="relative h-48 bg-gray-200">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
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
