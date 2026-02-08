'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Utensils, Bike, Check, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
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

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      PENDING: { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
      CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
      PREPARING: { label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Utensils },
      READY_FOR_PICKUP: { label: 'Ready', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: Package },
      OUT_FOR_DELIVERY: { label: 'On the way', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Bike },
      DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-300', icon: Check },
      CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Package };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Start ordering delicious food from your favorite restaurants
          </p>
          <Link
            href="/"
            className="inline-block bg-yellow-500 text-gray-900 px-8 py-4 rounded-full hover:bg-yellow-600 font-bold text-lg shadow-lg transition-all hover:scale-105"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-5 group border border-gray-100">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  {order.restaurant && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      {order.restaurant.imageUrl && (
                        <img
                          src={order.restaurant.imageUrl}
                          alt={order.restaurant.name}
                          className="w-12 h-12 object-cover rounded-xl"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {order.restaurant.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₹{order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm text-gray-700"
                      >
                        {item.name} <span className="text-gray-500">× {item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="bg-yellow-100 px-3 py-1.5 rounded-lg text-sm text-yellow-700 font-medium">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
