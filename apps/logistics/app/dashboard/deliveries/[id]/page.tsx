'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDeliveryStore } from '@/stores/delivery-store';
import { useLocationStore } from '@/stores/location-store';
import { DeliveryRouteInfo } from '@/components/delivery/delivery-route-info';

export default function DeliveryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deliveryId = params.id as string;
  const { activeDeliveries, markPickedUp, markDelivered, fetchActiveDeliveries } =
    useDeliveryStore();
  const { latitude, longitude, startTracking, isTracking } = useLocationStore();

  const [delivery, setDelivery] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchActiveDeliveries();

    // Start location tracking if not already tracking
    if (!isTracking) {
      startTracking();
    }
  }, [fetchActiveDeliveries, isTracking, startTracking]);

  useEffect(() => {
    const foundDelivery = activeDeliveries.find((d) => d.id === deliveryId);
    setDelivery(foundDelivery);

    // Debug logging
    if (foundDelivery) {
      console.log('Delivery status:', foundDelivery.status);
      console.log('Delivery order user data:', foundDelivery.order?.user);
    }
  }, [activeDeliveries, deliveryId]);

  const handleMarkPickedUp = async () => {
    try {
      setIsUpdating(true);
      await markPickedUp(deliveryId);
      // markPickedUp already calls fetchActiveDeliveries internally
    } catch (error) {
      console.error('Failed to mark as picked up:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      setIsUpdating(true);
      await markDelivered(deliveryId);
      router.push('/dashboard/deliveries');
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!delivery) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-sm sm:text-base text-gray-500">Loading delivery details...</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-blue-100 text-primary';
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800';
      case 'IN_TRANSIT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/dashboard/deliveries')}
        className="mb-3 sm:mb-6 text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
      >
        ← Back to Active Deliveries
      </button>

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-8 pb-3 sm:pb-6 border-b gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-2 break-words">
              Order #{delivery.order.orderNumber}
            </h1>
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                delivery.status
              )}`}
            >
              {delivery.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">₹{delivery.earnings}</div>
            <div className="text-xs sm:text-sm text-gray-500">Your earnings</div>
          </div>
        </div>

        {/* Progress Steps - Mobile Vertical */}
        <div className="mb-4 sm:mb-8 sm:hidden">
          <div className="space-y-3">
            {/* Step 1: Accepted */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  delivery.status === 'ACCEPTED' ||
                  delivery.status === 'PICKED_UP' ||
                  delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                ✓
              </div>
              <div className="flex-1 pt-2">
                <div className="font-medium text-sm">Accepted</div>
                <div className="text-xs text-gray-500">Order confirmed</div>
              </div>
            </div>

            {/* Connector */}
            <div className="ml-5 w-0.5 h-4 bg-gray-300">
              <div
                className={`w-full ${
                  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 h-full'
                    : 'bg-gray-300 h-0'
                }`}
              ></div>
            </div>

            {/* Step 2: Picked Up */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT' ? '✓' : '2'}
              </div>
              <div className="flex-1 pt-2">
                <div className="font-medium text-sm">Picked Up</div>
                <div className="text-xs text-gray-500">From restaurant</div>
              </div>
            </div>

            {/* Connector */}
            <div className="ml-5 w-0.5 h-4 bg-gray-300">
              <div
                className={`w-full ${
                  delivery.status === 'IN_TRANSIT' ? 'bg-green-600 h-full' : 'bg-gray-300 h-0'
                }`}
              ></div>
            </div>

            {/* Step 3: Delivered */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div className="flex-1 pt-2">
                <div className="font-medium text-sm">Delivered</div>
                <div className="text-xs text-gray-500">To customer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps - Desktop Horizontal */}
        <div className="mb-6 sm:mb-8 hidden sm:block">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  delivery.status === 'ACCEPTED' ||
                  delivery.status === 'PICKED_UP' ||
                  delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                ✓
              </div>
              <div className="text-sm mt-2 text-center font-medium">Accepted</div>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div
                className={`h-full transition-all duration-300 ${
                  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              ></div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT' ? '✓' : '2'}
              </div>
              <div className="text-sm mt-2 text-center font-medium">Picked Up</div>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div
                className={`h-full transition-all duration-300 ${
                  delivery.status === 'IN_TRANSIT' ? 'bg-green-600' : 'bg-gray-300'
                }`}
              ></div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                3
              </div>
              <div className="text-sm mt-2 text-center font-medium">Delivered</div>
            </div>
          </div>
        </div>

        {/* Route Distance & Earnings Calculator */}
        {latitude && longitude && (
          <DeliveryRouteInfo
            delivery={delivery}
            driverLocation={{ lat: latitude, lng: longitude }}
            costPerKm={10}
          />
        )}

        {/* Restaurant Info */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3">Pickup Location</h2>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="font-semibold text-base sm:text-lg mb-2 break-words">
              {delivery.order.restaurant.name}
            </div>
            <p className="text-sm sm:text-base text-gray-600 break-words">{delivery.order.restaurant.addressLine1}</p>
            <p className="text-sm sm:text-base text-gray-600 break-words">{delivery.order.restaurant.city}</p>
            {delivery.order.restaurant.phone && (
              <a
                href={`tel:${delivery.order.restaurant.phone}`}
                className="inline-block mt-2 text-sm sm:text-base text-primary hover:text-blue-700 break-all"
              >
                📞 {delivery.order.restaurant.phone}
              </a>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3">Delivery Location</h2>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="text-sm sm:text-base text-gray-900 break-words">{delivery.order.address.addressLine1}</p>
            {delivery.order.address.addressLine2 && (
              <p className="text-sm sm:text-base text-gray-600 break-words">{delivery.order.address.addressLine2}</p>
            )}
            <p className="text-sm sm:text-base text-gray-600 break-words">
              {delivery.order.address.city}, {delivery.order.address.state} -{' '}
              {delivery.order.address.postalCode}
            </p>
            {delivery.order.address.landmark && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">
                Landmark: {delivery.order.address.landmark}
              </p>
            )}
          </div>
        </div>

        {/* Customer Contact - Only visible after pickup */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3">Customer Contact</h2>

          {delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT' ? (
            delivery.order?.user ? (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Name:</span>
                  <span className="text-sm sm:text-base text-gray-900 break-words">
                    {delivery.order.user.name || 'Not provided'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Phone:</span>
                  <a
                    href={`tel:${delivery.order.user.phone}`}
                    className="text-sm sm:text-base text-primary hover:text-blue-700 hover:underline break-all"
                  >
                    {delivery.order.user.phone}
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">
                  Contact information not available
                </p>
              </div>
            )
          ) : (
            <div className="flex items-start gap-2 sm:gap-3 text-amber-600 bg-amber-50 p-3 sm:p-4 rounded-lg">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs sm:text-sm flex-1">
                Customer contact will be visible after you pick up the order
              </span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3">Order Items</h2>
          <div className="space-y-2 sm:space-y-3">
            {delivery.order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium break-words">{item.menuItem?.name || item.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Qty: {item.quantity}</div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="font-semibold text-base sm:text-lg">₹{item.price * item.quantity}</div>
                  <div className="text-xs text-gray-500">₹{item.price} × {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm sm:text-base font-semibold">Total Order Value:</span>
            <span className="text-lg sm:text-xl font-bold">₹{delivery.order.total}</span>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600 break-words">
            Payment Method: <span className="font-medium">{delivery.order.paymentMethod}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
          {delivery.status === 'ACCEPTED' && (
            <button
              onClick={handleMarkPickedUp}
              disabled={isUpdating}
              className="w-full py-3 sm:py-4 bg-purple-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Mark as Picked Up'}
            </button>
          )}

          {(delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') && (
            <button
              onClick={handleMarkDelivered}
              disabled={isUpdating}
              className="w-full py-3 sm:py-4 bg-green-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Completing...' : 'Mark as Delivered'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
