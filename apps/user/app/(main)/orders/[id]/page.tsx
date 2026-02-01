'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi, type Order } from '@/lib/api/orders.api';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await ordersApi.getOrderById(orderId);

      if (response.success && response.data) {
        setOrder(response.data.order);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;

    try {
      const response = await ordersApi.reorder(order.id);
      if (response.success) {
        router.push('/cart');
      }
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <button
          onClick={handleReorder}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Reorder
        </button>
      </div>

      {/* Order Status Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Order Status
          </h2>

          <div className="relative">
            <div className="flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-600">
                    {step.label}
                  </p>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute top-4 h-0.5 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{
                        left: `${(100 / statusSteps.length) * (index + 0.5)}%`,
                        width: `${100 / statusSteps.length}%`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          This order has been cancelled
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start py-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Address
              </h2>
              <div className="text-gray-700">
                <p className="font-medium mb-1">{order.address.label}</p>
                <p className="text-sm">{order.address.addressLine1}</p>
                {order.address.addressLine2 && (
                  <p className="text-sm">{order.address.addressLine2}</p>
                )}
                {order.address.landmark && (
                  <p className="text-sm">Landmark: {order.address.landmark}</p>
                )}
                <p className="text-sm">
                  {order.address.city}, {order.address.state} -{' '}
                  {order.address.postalCode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bill Details
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Taxes</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Paid</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Payment Method:{' '}
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'RAZORPAY' ? 'Online' : 'Cash on Delivery'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
