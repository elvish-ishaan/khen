'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantApi } from '@/lib/api/restaurant.api';
import { useAuthStore } from '@/stores/auth-store';
import { AcceptingOrdersToggle } from '@/components/accepting-orders-toggle';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  revenueToday: number;
  activeMenuItems: number;
}

interface Restaurant {
  id: string;
  name: string;
  isAcceptingOrders: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { owner, fetchOwner } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    revenueToday: 0,
    activeMenuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch owner to check onboarding status
        await fetchOwner();

        // Fetch restaurant profile
        const profileResponse = await restaurantApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setRestaurant({
            id: profileResponse.data.restaurant.id,
            name: profileResponse.data.restaurant.name,
            isAcceptingOrders: profileResponse.data.restaurant.isAcceptingOrders,
          });
        }

        // Fetch orders
        const ordersResponse = await restaurantApi.getOrders({ limit: 5 });
        if (ordersResponse.success && ordersResponse.data) {
          const orders = ordersResponse.data.orders;
          setRecentOrders(orders);

          // Calculate stats
          const pending = orders.filter(
            (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
          ).length;

          setStats((prev) => ({
            ...prev,
            //@ts-ignore
            totalOrders: ordersResponse?.data.pagination?.total,
            pendingOrders: pending,
          }));
        }

        // Fetch menu to count items
        const menuResponse = await restaurantApi.getMenu();
        if (menuResponse.success && menuResponse.data) {
          const itemCount = menuResponse.data.categories.reduce(
            (sum, cat) => sum + (cat.items?.length || 0),
            0
          );
          setStats((prev) => ({ ...prev, activeMenuItems: itemCount }));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchOwner]);

  // Redirect if onboarding not complete
  useEffect(() => {
    if (owner && owner.onboardingStatus !== 'COMPLETED') {
      router.push('/documents');
    }
  }, [owner, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Order Acceptance Toggle */}
      {restaurant && (
        <div className="mb-6">
          <AcceptingOrdersToggle
            initialStatus={restaurant.isAcceptingOrders}
            onToggle={(newStatus) => {
              setRestaurant((prev) => prev ? { ...prev, isAcceptingOrders: newStatus } : null);
            }}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm font-medium mb-1">Total Orders</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h2 className="text-gray-500 text-sm font-medium mb-1">Pending Orders</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
          <p className="text-xs text-gray-500 mt-2">Needs attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm font-medium mb-1">Revenue Today</h2>
          <p className="text-3xl font-bold text-gray-900">₹{stats.revenueToday}</p>
          <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h2 className="text-gray-500 text-sm font-medium mb-1">Menu Items</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.activeMenuItems}</p>
          <p className="text-xs text-gray-500 mt-2">Active items</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <button
            onClick={() => router.push('/orders')}
            className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">#{order.orderNumber}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {order.user.name || order.user.phone}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{order.total}</div>
                    <div
                      className={`
                        mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'PREPARING'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No orders yet</p>
            <p className="text-sm">Orders will appear here once customers start ordering</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold mb-1">Manage Orders</h3>
          <p className="text-sm text-gray-600">View and update order status</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/menu')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="text-2xl mb-2">🍽️</div>
          <h3 className="font-semibold mb-1">Edit Menu</h3>
          <p className="text-sm text-gray-600">Add or update menu items</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/settings')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <h3 className="font-semibold mb-1">Settings</h3>
          <p className="text-sm text-gray-600">Update restaurant details</p>
        </button>
      </div>
    </div>
  );
}
