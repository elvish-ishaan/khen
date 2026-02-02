'use client';

import { useEffect, useState } from 'react';
import { reviewsApi, type Review } from '@/lib/api/reviews.api';
import { ReviewCard } from './review-card';
import { StarRating } from './star-rating';

interface ReviewsListProps {
  restaurantId: string;
  averageRating: number;
  totalReviews: number;
}

export function ReviewsList({
  restaurantId,
  averageRating,
  totalReviews,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await reviewsApi.getRestaurantReviews(restaurantId);

      if (response.success && response.data) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Summary Header */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="md" readonly />
            <p className="text-sm text-gray-600 mt-1">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No reviews yet</p>
          <p className="text-sm">Be the first to review this restaurant!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
