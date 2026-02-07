'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useDeliveryStore } from '@/stores/delivery-store';
import { useLocationStore } from '@/stores/location-store';
import { logisticsApi } from '@/lib/api/logistics.api';

export default function DashboardPage() {
  const router = useRouter();
  const { personnel, fetchMe } = useAuthStore();
  const { startDuty, endDuty, isOnDuty, initializeDutyStatus } = useDeliveryStore();
  const { startTracking, stopTracking, error: locationError, clearError: clearLocationError } = useLocationStore();
  const [stats, setStats] = useState<any>(null);
  const [dutyError, setDutyError] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (personnel) {
      loadDashboardStats();
    }
  }, [personnel]);

  // Sync duty status from personnel to delivery store
  useEffect(() => {
    if (personnel?.isOnDuty !== undefined) {
      initializeDutyStatus(personnel.isOnDuty);
    }
  }, [personnel?.isOnDuty, initializeDutyStatus]);

  const loadDashboardStats = async () => {
    try {
      const response = await logisticsApi.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDutyToggle = async () => {
    setDutyError(null);
    clearLocationError();

    try {
      if (isOnDuty) {
        // End duty first, then stop tracking
        await endDuty();
        stopTracking();
      } else {
        // Start location tracking first
        await startTracking();

        // Check if location tracking started successfully
        if (locationError) {
          setDutyError('Failed to start location tracking. Please enable location permissions.');
          return;
        }

        // Then start duty
        await startDuty();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle duty';
      setDutyError(errorMessage);
      console.error('Failed to toggle duty:', error);

      // If starting duty failed, stop location tracking
      if (!isOnDuty) {
        stopTracking();
      }
    }
  };

  if (!personnel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (personnel.onboardingStatus !== 'APPROVED') {
    // If status is PENDING, redirect to pending-review page
    if (personnel.onboardingStatus === 'PENDING') {
      router.push('/pending-review');
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      );
    }

    // For NOT_STARTED or any other status, redirect to onboarding
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Onboarding Required
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Please complete the onboarding process to access your dashboard.
          </p>
          <button
            onClick={() => router.push('/documents')}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Continue Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {personnel.name || 'Partner'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your deliveries and earnings</p>
        </div>

        {/* Duty Toggle */}
        <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Duty Status</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {isOnDuty ? 'You are currently on duty' : 'You are currently off duty'}
              </p>
            </div>
            <button
              onClick={handleDutyToggle}
              className={`w-full sm:w-auto px-6 py-2 rounded-md font-medium ${
                isOnDuty
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isOnDuty ? 'End Duty' : 'Start Duty'}
            </button>
          </div>

          {/* Error Messages */}
          {(locationError || dutyError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                {locationError || dutyError}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600">Today's Earnings</h4>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                ₹{formatCurrency(stats.today?.earnings || 0)}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.today?.deliveries || 0} deliveries
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600">Weekly Earnings</h4>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                ₹{formatCurrency(stats.weekly?.earnings || 0)}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.weekly?.deliveries || 0} deliveries
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600">Monthly Earnings</h4>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                ₹{formatCurrency(stats.monthly?.earnings || 0)}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.monthly?.deliveries || 0} deliveries
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600">Pending Balance</h4>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-green-600">
                ₹{formatCurrency(stats.pendingBalance || 0)}
              </p>
              <p className="mt-1 text-sm text-gray-600">Available for withdrawal</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Available Orders</h3>
            <p className="mt-2 text-sm text-gray-600">
              View and accept nearby orders
            </p>
          </button>

          <button
            onClick={() => router.push('/dashboard/deliveries')}
            className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Active Deliveries</h3>
            <p className="mt-2 text-sm text-gray-600">
              {stats?.activeDeliveries || 0} active deliveries
            </p>
          </button>

          <button
            onClick={() => router.push('/dashboard/earnings')}
            className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
            <p className="mt-2 text-sm text-gray-600">
              View earnings and request withdrawal
            </p>
          </button>
        </div>
    </div>
  );
}
