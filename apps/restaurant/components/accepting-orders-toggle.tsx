'use client';

import { useState } from 'react';
import { restaurantApi } from '@/lib/api/restaurant.api';

interface AcceptingOrdersToggleProps {
  initialStatus: boolean;
  onToggle?: (newStatus: boolean) => void;
}

export function AcceptingOrdersToggle({ initialStatus, onToggle }: AcceptingOrdersToggleProps) {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    const newStatus = !isAcceptingOrders;
    setIsLoading(true);
    setError('');

    try {
      const response = await restaurantApi.toggleAcceptingOrders(newStatus);

      if (response.success) {
        setIsAcceptingOrders(newStatus);
        onToggle?.(newStatus);
      } else {
        setError(response.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Failed to toggle accepting orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Order Acceptance</h2>
          <p className="text-sm text-gray-600">
            {isAcceptingOrders
              ? 'Your restaurant is currently accepting orders'
              : 'Your restaurant is currently not accepting orders'}
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isAcceptingOrders ? 'bg-green-500 focus:ring-green-500' : 'bg-gray-300 focus:ring-gray-400'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label="Toggle order acceptance"
        >
          <span
            className={`
              inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
              ${isAcceptingOrders ? 'translate-x-11' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${
              isAcceptingOrders
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          `}
        >
          <span
            className={`
              mr-1.5 h-2 w-2 rounded-full
              ${isAcceptingOrders ? 'bg-green-500' : 'bg-red-500'}
            `}
          />
          {isAcceptingOrders ? 'ACCEPTING ORDERS' : 'NOT ACCEPTING ORDERS'}
        </span>

        {isLoading && (
          <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
