'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, MapPin, Package, ArrowLeft, Clock, CheckCircle, Utensils, Truck, Check } from 'lucide-react';
import { restaurantApi } from '@/lib/api/restaurant.api';
import { StatusBadge, type OrderStatus } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { OrderDetailSkeleton } from '@/components/loading-skeleton';

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
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Order not found</p>
      </div>
    );
  }

  // Status timeline steps
  const statusSteps = [
    { status: 'PENDING', label: 'Pending', icon: Clock },
    { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { status: 'PREPARING', label: 'Preparing', icon: Utensils },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: Check },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.status === order.status);

  return (
    <div>
      {/* Back Button */}
      <Button
        variant="ghost"
        icon={ArrowLeft}
        onClick={() => router.push('/dashboard/orders')}
        className="mb-6"
      >
        Back to Orders
      </Button>

      {/* Order Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              {new Date(order.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <StatusBadge status={order.status as OrderStatus} size="lg" />
        </div>

        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Order Progress</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.status} className="flex-1 flex flex-col items-center relative">
                    {/* Connector Line */}
                    {index > 0 && (
                      <div
                        className={`absolute left-0 top-5 w-full h-1 -ml-1/2 ${
                          isCompleted ? 'bg-green-500' : isCurrent ? 'bg-yellow-500' : 'bg-gray-200'
                        }`}
                        style={{ width: 'calc(100% - 2.5rem)', left: 'calc(-50% + 1.25rem)' }}
                      />
                    )}

                    {/* Icon Circle */}
                    <div className="relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-yellow-500 text-white shadow-lg scale-110'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Name:</span>{' '}
                {order.user.name || 'Not provided'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Phone:</span> {order.user.phone}
              </p>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
            </div>
            <div className="text-gray-700">
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>
                {order.address.city}, {order.address.state} - {order.address.postalCode}
              </p>
              {order.address.landmark && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Landmark:</span> {order.address.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ₹{item.price} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update Actions */}
          {order.status !== 'DELIVERED' &&
            order.status !== 'CANCELLED' &&
            order.status !== 'OUT_FOR_DELIVERY' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h2>
                <div className="flex flex-wrap gap-3">
                  {order.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      icon={CheckCircle}
                      onClick={() => handleStatusChange('CONFIRMED')}
                      isLoading={updating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      variant="primary"
                      icon={Utensils}
                      onClick={() => handleStatusChange('PREPARING')}
                      isLoading={updating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Mark as Preparing
                    </Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button
                      variant="primary"
                      icon={Truck}
                      onClick={() => handleStatusChange('READY_FOR_PICKUP')}
                      isLoading={updating}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Mark as Ready for Pickup
                    </Button>
                  )}
                </div>
                {order.status === 'READY_FOR_PICKUP' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Order is ready for pickup. Waiting for a delivery partner to accept...
                    </p>
                  </div>
                )}
              </div>
            )}

          {order.status === 'OUT_FOR_DELIVERY' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-orange-800 font-medium">
                    Order is out for delivery. The delivery partner will mark it as delivered.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Payment Summary - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee:</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span>₹{order.tax}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Payment Method:</span>{' '}
                {order.paymentMethod}
              </p>
              {order.payment && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Payment Status:</span>{' '}
                  <span
                    className={`font-semibold ${
                      order.payment.status === 'SUCCESS'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
