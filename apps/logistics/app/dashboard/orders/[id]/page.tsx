'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { logisticsApi } from '@/lib/api/logistics.api';
import { useDeliveryStore } from '@/stores/delivery-store';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { acceptOrder } = useDeliveryStore();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      // For now, we'll get it from available orders list
      // In production, you'd have a separate endpoint for order details
      const response = await logisticsApi.getAvailableOrders();

      if (response.success && response.data) {
        const foundOrder = response.data.orders?.find((o: any) => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found or already accepted');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      setIsAccepting(true);
      setError('');
      await acceptOrder(orderId);
      router.push('/dashboard/deliveries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept order');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 mb-4">{error || 'Order not found'}</div>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Available Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/dashboard/orders')}
        className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
      >
        ← Back to Available Orders
      </button>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">Ready for pickup</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              ₹{order.estimatedEarnings?.toFixed(2) || 0}
            </div>
            <div className="text-sm text-gray-500">Estimated earnings</div>
          </div>
        </div>

        {/* Distance Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Distance to Restaurant</div>
            <div className="text-2xl font-bold text-blue-900">
              {order.distanceToRestaurant?.toFixed(1)} km
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Delivery Distance</div>
            <div className="text-2xl font-bold text-green-900">
              {order.deliveryDistance?.toFixed(1)} km
            </div>
            <div className="text-xs text-gray-600 mt-1">
              ₹10 per km = ₹{(order.deliveryDistance * 10)?.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pickup Location</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-semibold text-lg mb-2">{order.restaurant.name}</div>
            <p className="text-gray-600">{order.restaurant.addressLine1}</p>
            <p className="text-gray-600">{order.restaurant.city}</p>
            {order.restaurant.phone && (
              <p className="text-sm text-gray-500 mt-2">
                Phone: {order.restaurant.phone}
              </p>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Delivery Location</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900">{order.address.addressLine1}</p>
            {order.address.addressLine2 && (
              <p className="text-gray-600">{order.address.addressLine2}</p>
            )}
            <p className="text-gray-600">
              {order.address.city}, {order.address.state} - {order.address.postalCode}
            </p>
            {order.address.landmark && (
              <p className="text-sm text-gray-500 mt-2">
                Landmark: {order.address.landmark}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
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
            <span className="text-xl font-bold">₹{order.total}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Payment Method:</span> {order.paymentMethod}
            </p>
            {order.deliveryInstructions && (
              <p className="text-sm mt-2">
                <span className="font-medium">Delivery Instructions:</span>{' '}
                {order.deliveryInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Accept Button */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                First come, first served
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This order is visible to all delivery partners in the area. Accept quickly to
                secure it!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleAcceptOrder}
          disabled={isAccepting}
          className="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isAccepting ? 'Accepting Order...' : 'Accept Order'}
        </button>
      </div>
    </div>
  );
}
