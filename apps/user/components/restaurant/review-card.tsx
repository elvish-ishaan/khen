import { StarRating } from './star-rating';
import type { Review } from '@/lib/api/reviews.api';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">
            {review.user?.name || 'Anonymous User'}
          </p>
          <StarRating rating={review.rating} size="sm" readonly />
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}
