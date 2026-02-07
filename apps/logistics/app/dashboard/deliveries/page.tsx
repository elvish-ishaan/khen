'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryStore } from '@/stores/delivery-store';

export default function ActiveDeliveriesPage() {
  const router = useRouter();
  const { activeDeliveries, fetchActiveDeliveries, isLoading } = useDeliveryStore();

  useEffect(() => {
    fetchActiveDeliveries();
  }, [fetchActiveDeliveries]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800';
      case 'IN_TRANSIT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading deliveries...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Deliveries</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Your ongoing delivery orders</p>
        </div>
        <button
          onClick={fetchActiveDeliveries}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {activeDeliveries.length === 0 ? (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active deliveries</h3>
          <p className="mt-1 text-sm text-gray-500">
            Accept orders from the available orders page to get started.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              View Available Orders
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/deliveries/${delivery.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{delivery.order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {delivery.order.restaurant.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    delivery.status
                  )}`}
                >
                  {delivery.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Distance</div>
                  <div className="font-medium">{delivery.distance?.toFixed(1)} km</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Earnings</div>
                  <div className="font-medium text-green-600">₹{delivery.earnings}</div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Pickup:</span>{' '}
                  {delivery.order.restaurant.addressLine1}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Deliver to:</span>{' '}
                  {delivery.order.address.addressLine1}, {delivery.order.address.city}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/deliveries/${delivery.id}`);
                  }}
                  className="w-full px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
                >
                  View & Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
