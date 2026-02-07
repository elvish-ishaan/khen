'use client';

import { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    title: 'Experience our delicious new dish',
    discount: '30% OFF',
    bgColor: 'from-orange-400 to-orange-500',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: 'Fresh & Healthy Meals',
    discount: '25% OFF',
    bgColor: 'from-green-400 to-green-500',
    textColor: 'text-white',
  },
  {
    id: 3,
    title: 'Weekend Special Offers',
    discount: '40% OFF',
    bgColor: 'from-red-400 to-red-500',
    textColor: 'text-white',
  },
];

export function PromotionalBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeBanner = banners[currentBanner]!;

  // Auto-rotate banners every 4 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentBanner(index);
  };

  return (
    <div className="px-4 py-6">
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Banner */}
        <div
          className={`bg-gradient-to-r ${activeBanner.bgColor} rounded-2xl p-6 shadow-lg overflow-hidden relative transition-all duration-500`}
        >
          {/* Decorative Circles */}
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <p className={`${activeBanner.textColor} text-sm mb-2 font-medium`}>
              {activeBanner.title}
            </p>
            <h3 className={`${activeBanner.textColor} text-4xl font-bold`}>
              {activeBanner.discount}
            </h3>
          </div>

          {/* Pizza or Food Image Placeholder */}
          <div className="absolute -right-4 -bottom-4 w-40 h-40 opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="white" opacity="0.2" />
              <circle cx="35" cy="35" r="8" fill="white" opacity="0.3" />
              <circle cx="65" cy="40" r="6" fill="white" opacity="0.3" />
              <circle cx="50" cy="60" r="7" fill="white" opacity="0.3" />
            </svg>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentBanner
                  ? 'w-6 bg-yellow-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
