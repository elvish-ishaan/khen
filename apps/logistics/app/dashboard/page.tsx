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
  const { startDuty, endDuty, isOnDuty } = useDeliveryStore();
  const { startTracking, stopTracking, error: locationError, clearError: clearLocationError } = useLocationStore();
  const [stats, setStats] = useState<any>(null);
  const [dutyError, setDutyError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (personnel) {
      loadDashboardStats();
    }
  }, [personnel]);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Onboarding Required
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is {personnel.onboardingStatus}. Please complete the onboarding process.
          </p>
          <button
            onClick={() => router.push('/documents')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {personnel.name || 'Partner'}!
          </h1>
          <p className="mt-2 text-gray-600">Manage your deliveries and earnings</p>
        </div>

        {/* Duty Toggle */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Duty Status</h3>
              <p className="text-sm text-gray-600">
                {isOnDuty ? 'You are currently on duty' : 'You are currently off duty'}
              </p>
            </div>
            <button
              onClick={handleDutyToggle}
              className={`px-6 py-2 rounded-md font-medium ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-600">Today's Earnings</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ₹{stats.today?.earnings || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.today?.deliveries || 0} deliveries
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-600">Weekly Earnings</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ₹{stats.weekly?.earnings || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.weekly?.deliveries || 0} deliveries
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-600">Monthly Earnings</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ₹{stats.monthly?.earnings || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.monthly?.deliveries || 0} deliveries
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-600">Pending Balance</h4>
              <p className="mt-2 text-3xl font-bold text-green-600">
                ₹{stats.pendingBalance || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600">Available for withdrawal</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Available Orders</h3>
            <p className="mt-2 text-sm text-gray-600">
              View and accept nearby orders
            </p>
          </button>

          <button
            onClick={() => router.push('/dashboard/deliveries')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Active Deliveries</h3>
            <p className="mt-2 text-sm text-gray-600">
              {stats?.activeDeliveries || 0} active deliveries
            </p>
          </button>

          <button
            onClick={() => router.push('/dashboard/earnings')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
            <p className="mt-2 text-sm text-gray-600">
              View earnings and request withdrawal
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
