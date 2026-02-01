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
  }, [activeDeliveries, deliveryId]);

  const handleMarkPickedUp = async () => {
    try {
      setIsUpdating(true);
      await markPickedUp(deliveryId);
      await fetchActiveDeliveries();
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading delivery details...</div>
        </div>
      </div>
    );
  }

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

  return (
    <div>
      <button
        onClick={() => router.push('/dashboard/deliveries')}
        className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
      >
        ← Back to Active Deliveries
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Order #{delivery.order.orderNumber}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                delivery.status
              )}`}
            >
              {delivery.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">₹{delivery.earnings}</div>
            <div className="text-sm text-gray-500">Your earnings</div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  delivery.status === 'ACCEPTED' ||
                  delivery.status === 'PICKED_UP' ||
                  delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <div className="text-xs mt-2 text-center">Accepted</div>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div
                className={`h-full ${
                  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              ></div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <div className="text-xs mt-2 text-center">Picked Up</div>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div
                className={`h-full ${
                  delivery.status === 'IN_TRANSIT' ? 'bg-green-600' : 'bg-gray-300'
                }`}
              ></div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                3
              </div>
              <div className="text-xs mt-2 text-center">Delivered</div>
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
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pickup Location</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-semibold text-lg mb-2">
              {delivery.order.restaurant.name}
            </div>
            <p className="text-gray-600">{delivery.order.restaurant.addressLine1}</p>
            <p className="text-gray-600">{delivery.order.restaurant.city}</p>
            {delivery.order.restaurant.phone && (
              <a
                href={`tel:${delivery.order.restaurant.phone}`}
                className="inline-block mt-2 text-blue-600 hover:text-blue-700"
              >
                📞 {delivery.order.restaurant.phone}
              </a>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Delivery Location</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900">{delivery.order.address.addressLine1}</p>
            {delivery.order.address.addressLine2 && (
              <p className="text-gray-600">{delivery.order.address.addressLine2}</p>
            )}
            <p className="text-gray-600">
              {delivery.order.address.city}, {delivery.order.address.state} -{' '}
              {delivery.order.address.postalCode}
            </p>
            {delivery.order.address.landmark && (
              <p className="text-sm text-gray-500 mt-2">
                Landmark: {delivery.order.address.landmark}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {delivery.order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{item.menuItem?.name || item.name}</div>
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-semibold">Total Order Value:</span>
            <span className="text-xl font-bold">₹{delivery.order.total}</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Payment Method: {delivery.order.paymentMethod}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {delivery.status === 'ACCEPTED' && (
            <button
              onClick={handleMarkPickedUp}
              disabled={isUpdating}
              className="w-full py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Mark as Picked Up'}
            </button>
          )}

          {(delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') && (
            <button
              onClick={handleMarkDelivered}
              disabled={isUpdating}
              className="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Completing...' : 'Mark as Delivered'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
