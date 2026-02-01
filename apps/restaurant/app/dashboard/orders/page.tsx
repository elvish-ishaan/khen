'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantApi } from '@/lib/api/restaurant.api';

type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

const statusOptions: OrderStatus[] = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('ALL');

  const fetchOrders = async (status?: string) => {
    setIsLoading(true);
    try {
      const response = await restaurantApi.getOrders({
        status: status !== 'ALL' ? status : undefined,
        limit: 50,
      });

      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // Optimistically update UI
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Update on server
    restaurantApi.updateOrderStatus(orderId, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-gray-600">Manage your restaurant orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${
                selectedStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">#{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Customer:</span>{' '}
                        {order.user.name || order.user.phone}
                      </p>
                      <p>
                        <span className="font-medium">Items:</span>{' '}
                        {order.items?.length || 0} items
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{' '}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">₹{order.total}</div>
                  </div>

                  {/* Status Update */}
                  <div className="lg:w-48">
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'OUT_FOR_DELIVERY' ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                        <option value="CANCELLED">Cancel</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : order.status}
                      </span>
                    )}
                  </div>

                  {/* View Details */}
                  <button
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="lg:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">No {selectedStatus !== 'ALL' ? selectedStatus.toLowerCase() : ''} orders found</p>
            <p className="text-sm">Orders will appear here when customers place them</p>
          </div>
        )}
      </div>
    </div>
  );
}
