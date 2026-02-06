'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi, type Order } from '@/lib/api/orders.api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await ordersApi.getOrders();

      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm sm:text-base">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            No orders yet
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Start ordering from your favorite restaurants
          </p>
          <Link
            href="/"
            className="inline-block bg-yellow-500 text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-md hover:bg-yellow-600 font-medium text-sm sm:text-base"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">Your Orders</h1>

      <div className="space-y-3 sm:space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <span className={`text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    ₹{order.total.toFixed(2)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {order.restaurant && (
                <div className="flex items-center gap-3 mb-3">
                  {order.restaurant.imageUrl && (
                    <img
                      src={order.restaurant.imageUrl}
                      alt={order.restaurant.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {order.restaurant.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-xs sm:text-sm text-gray-600">
                      {item.name} × {item.quantity}
                      {idx < Math.min(2, order.items.length - 1) && ','}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs sm:text-sm text-gray-600">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
