'use client';

import { useState } from 'react';
import { reviewsApi } from '@/lib/api/reviews.api';
import { StarRating } from './star-rating';

interface ReviewFormProps {
  orderId: string;
  restaurantName: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  orderId,
  restaurantName,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await reviewsApi.createReview({
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError(response.error || 'Failed to submit review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thank you for your review!
          </h3>
          <p className="text-gray-600">
            Your feedback helps others discover great restaurants.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Rate your experience at {restaurantName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <StarRating
            rating={rating}
            size="lg"
            readonly={false}
            onChange={setRating}
          />
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </p>
          )}
        </div>

        {/* Comment Input */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this restaurant..."
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
