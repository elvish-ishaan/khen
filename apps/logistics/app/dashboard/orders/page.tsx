'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logisticsApi } from '@/lib/api/logistics.api';

export default function AvailableOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await logisticsApi.getAvailableOrders();

      if (response.success && response.data) {
        //@ts-ignore
        setOrders(response.data?.orders || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading available orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Orders</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Orders within 10km radius</p>
        </div>
        <button
          onClick={loadOrders}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders available</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no orders ready for pickup in your area right now.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Make sure you are on duty and have enabled location access.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.restaurant.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ₹{order.estimatedEarnings?.toFixed(2) || 0}
                  </div>
                  <div className="text-xs text-gray-500">Estimated earnings</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Distance to Restaurant</div>
                  <div className="font-medium">{order.distanceToRestaurant?.toFixed(1)} km</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Delivery Distance</div>
                  <div className="font-medium">{order.deliveryDistance?.toFixed(1)} km</div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Pickup:</span> {order.restaurant.addressLine1}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Deliver to:</span>{' '}
                  {order.address.addressLine1}, {order.address.city}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {order.items?.length || 0} item(s) • ₹{order.total}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/orders/${order.id}`);
                  }}
                  className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
