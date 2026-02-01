'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { restaurantApi } from '@/lib/api/restaurant.api';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await restaurantApi.getOrderById(orderId);
        if (response.success && response.data) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await restaurantApi.updateOrderStatus(orderId, newStatus);
      if (response.success && response.data) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
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
        <div className="text-gray-500">Order not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <button
        onClick={() => router.push('/orders')}
        className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Customer Details</h2>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p>
              <span className="font-medium">Name:</span>{' '}
              {order.user.name || 'Not provided'}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {order.user.phone}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>{order.address.addressLine1}</p>
            {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
            <p>
              {order.address.city}, {order.address.state} - {order.address.postalCode}
            </p>
            {order.address.landmark && (
              <p className="text-sm text-gray-600 mt-2">
                Landmark: {order.address.landmark}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{item.price * item.quantity}</div>
                  <div className="text-sm text-gray-600">
                    ₹{item.price} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{order.tax}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>₹{order.total}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm">
                <span className="font-medium">Payment Method:</span>{' '}
                {order.paymentMethod}
              </p>
              {order.payment && (
                <p className="text-sm">
                  <span className="font-medium">Payment Status:</span>{' '}
                  <span
                    className={
                      order.payment.status === 'SUCCESS'
                        ? 'text-green-600 font-medium'
                        : 'text-yellow-600 font-medium'
                    }
                  >
                    {order.payment.status}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Update Status */}
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'OUT_FOR_DELIVERY' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <div className="flex flex-wrap gap-3">
              {order.status === 'PENDING' && (
                <button
                  onClick={() => handleStatusChange('CONFIRMED')}
                  disabled={updating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {updating ? 'Updating...' : 'Mark as CONFIRMED'}
                </button>
              )}
              {order.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStatusChange('PREPARING')}
                  disabled={updating}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {updating ? 'Updating...' : 'Mark as PREPARING'}
                </button>
              )}
              {order.status === 'PREPARING' && (
                <button
                  onClick={() => handleStatusChange('READY_FOR_PICKUP')}
                  disabled={updating}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {updating ? 'Updating...' : 'Mark as READY FOR PICKUP'}
                </button>
              )}
            </div>
            {order.status === 'READY_FOR_PICKUP' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ✅ Order is ready for pickup. Waiting for a delivery partner to accept...
                </p>
              </div>
            )}
          </div>
        )}

        {order.status === 'OUT_FOR_DELIVERY' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              🚚 Order is out for delivery. The delivery partner will mark it as delivered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
