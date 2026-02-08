'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { restaurantApi } from '@/lib/api/restaurant.api';
import { OrderCard } from '@/components/order-card';
import { EmptyState } from '@/components/empty-state';
import { OrderListSkeleton } from '@/components/loading-skeleton';

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Manage your restaurant orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`
              px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap shadow-sm
              ${
                selectedStatus === status
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrderListSkeleton />
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={(id) => router.push(`/dashboard/orders/${id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={`No ${selectedStatus !== 'ALL' ? selectedStatus.toLowerCase() : ''} orders`}
          description="Orders will appear here when customers place them from your restaurant."
        />
      )}
    </div>
  );
}
