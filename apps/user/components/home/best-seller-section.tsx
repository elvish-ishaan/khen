'use client';

import Link from 'next/link';
import type { Restaurant } from '@/lib/api/restaurants.api';
import { ChevronRight } from 'lucide-react';

interface BestSellerSectionProps {
  restaurants: Restaurant[];
  isLoading: boolean;
}

export function BestSellerSection({ restaurants, isLoading }: BestSellerSectionProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Best Seller</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 h-36 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Best Seller</h2>
        <button className="text-yellow-600 text-sm font-medium flex items-center gap-1 hover:text-yellow-700">
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={`/restaurant/${restaurant.slug}`}
            className="flex-shrink-0 group"
          >
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all">
              {(restaurant.coverImageUrl || restaurant.imageUrl) ? (
                <img
                  src={restaurant.coverImageUrl || restaurant.imageUrl || ''}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400" />
              )}

              {/* Price Tag */}
              {restaurant.minOrderAmount !== undefined && (
                <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ₹{restaurant.minOrderAmount}
                </div>
              )}

              {/* Restaurant Name Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-8 left-2 right-2">
                  <p className="text-white text-xs font-semibold line-clamp-2">
                    {restaurant.name}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
