'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Clock, DollarSign, Utensils, Package, Settings, Bell, BellOff } from 'lucide-react';
import { restaurantApi } from '@/lib/api/restaurant.api';
import { useAuthStore } from '@/stores/auth-store';
import { AcceptingOrdersToggle } from '@/components/accepting-orders-toggle';
import { StatsCard } from '@/components/stats-card';
import { OrderCard } from '@/components/order-card';
import { EmptyState } from '@/components/empty-state';
import { StatsGridSkeleton, OrderListSkeleton } from '@/components/loading-skeleton';
import { NotificationDiagnostics } from '@/components/notification-diagnostics';
// IMPORTANT: Import Firebase to initialize it before using FCM
import '@/lib/firebase';
import { requestNotificationPermission, onForegroundMessage, showNotification, isNotificationPermissionGranted } from '@/lib/fcm';

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
      const status = owner.onboardingStatus;

      // Redirect to appropriate onboarding step
      if (status === 'PENDING_DOCUMENTS') {
        router.push('/documents');
      } else if (status === 'PENDING_BANK_DETAILS') {
        router.push('/bank-details');
      } else if (status === 'PENDING_MENU') {
        router.push('/restaurant-info');
      } else if (status === 'PENDING_LOCATION') {
        router.push('/menu');
      } else {
        router.push('/documents'); // Default to first step
      }
    }
  }, [owner, router]);

  // Register FCM token for push notifications
  useEffect(() => {
    if (!owner || owner.onboardingStatus !== 'COMPLETED') {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        console.log('🔔 [Dashboard] Setting up push notifications...');

        // Request notification permission and get FCM token
        const fcmToken = await requestNotificationPermission();

        if (fcmToken) {
          console.log('📱 [Dashboard] FCM token received, registering with backend...');

          // Register token with backend
          const result = await restaurantApi.registerFcmToken(fcmToken);

          if (result.success) {
            console.log('✅ [Dashboard] FCM token registered successfully with backend');
          } else {
            console.error('❌ [Dashboard] Failed to register FCM token:', result.error);
          }

          // Listen for foreground messages
          console.log('👂 [Dashboard] Setting up foreground message listener...');
          unsubscribe = onForegroundMessage((payload) => {
            console.log('🔔 [Dashboard] Foreground notification received!');
            console.log('📦 [Dashboard] Payload:', payload);

            // Show notification
            const title = payload.notification?.title || 'New Order!';
            const body = payload.notification?.body || 'You have a new order';

            console.log('📢 [Dashboard] Displaying notification:', title, body);

            showNotification(title, {
              body,
              tag: payload.data?.orderId || 'order-notification',
              data: payload.data,
            });

            // Optionally refresh orders list
            if (payload.data?.orderId) {
              console.log('🔔 [Dashboard] New order received:', payload.data.orderId);
              // You could fetch new orders here or show a toast
              // For now, just log it
            }
          });

          console.log('✅ [Dashboard] Notification setup complete!');
        } else {
          console.log('⚠️ [Dashboard] Unable to get FCM token. Notifications will not work.');
          console.log('💡 [Dashboard] Make sure you have granted notification permission in browser settings.');
        }
      } catch (error) {
        console.error('❌ [Dashboard] Error setting up notifications:', error);
        if (error instanceof Error) {
          console.error('❌ [Dashboard] Error details:', error.message, error.stack);
        }
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [owner]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{getGreeting()}!</h1>
          <p className="text-sm sm:text-base text-gray-600">Loading your dashboard...</p>
        </div>
        <StatsGridSkeleton />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {restaurant?.name || 'Chef'}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's your restaurant overview.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All time"
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Needs attention"
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Revenue Today"
          value={`₹${stats.revenueToday}`}
          subtitle="Last 24 hours"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Menu Items"
          value={stats.activeMenuItems}
          subtitle="Active items"
          icon={Utensils}
          color="purple"
        />
      </div>

      {/* Recent Orders */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Orders</h2>
          {recentOrders.length > 0 && (
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="text-yellow-600 hover:text-yellow-700 font-medium text-sm self-start sm:self-auto"
            >
              View All →
            </button>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {recentOrders.map((order) => (
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
            title="No orders yet"
            description="Orders will appear here once customers start ordering from your restaurant."
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="bg-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-base sm:text-lg mb-1">Manage Orders</h3>
          <p className="text-xs sm:text-sm text-gray-600">View and update order status</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/menu')}
          className="bg-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-200 transition-colors">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-base sm:text-lg mb-1">Edit Menu</h3>
          <p className="text-xs sm:text-sm text-gray-600">Add or update menu items</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/settings')}
          className="bg-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-yellow-200 transition-colors">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-base sm:text-lg mb-1">Settings</h3>
          <p className="text-xs sm:text-sm text-gray-600">Update restaurant details</p>
        </button>
      </div>

      {/* Notification Diagnostics - Floating button in bottom right */}
      <NotificationDiagnostics />
    </div>
  );
}
