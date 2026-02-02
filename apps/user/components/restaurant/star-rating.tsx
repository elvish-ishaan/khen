'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  readonly = true,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  return (
    <div
      className={`flex items-center gap-0.5 ${sizeClasses[size]} ${
        !readonly ? 'cursor-pointer' : ''
      }`}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <span
            key={index}
            className={`${
              isFilled ? 'text-yellow-500' : 'text-gray-300'
            } transition-colors ${!readonly ? 'hover:text-yellow-400' : ''}`}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(null)}
            onClick={() => handleClick(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
