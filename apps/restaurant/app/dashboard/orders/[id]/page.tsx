'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, MapPin, Package, ArrowLeft, Clock, CheckCircle, Utensils, Truck, Check, XCircle } from 'lucide-react';
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
      if (response.success) {
        // Refetch the complete order details to ensure all fields are populated
        const orderResponse = await restaurantApi.getOrderById(orderId);
        if (orderResponse.success && orderResponse.data) {
          setOrder(orderResponse.data.order);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    setUpdating(true);
    try {
      const response = await restaurantApi.updateOrderStatus(orderId, 'CANCELLED');
      if (response.success) {
        // Refetch the complete order details
        const orderResponse = await restaurantApi.getOrderById(orderId);
        if (orderResponse.success && orderResponse.data) {
          setOrder(orderResponse.data.order);
          setShowCancelModal(false);
          setCancelReason('');
        }
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4">
        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" />
        <p className="text-gray-500 text-base sm:text-lg">Order not found</p>
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
    <div className="px-4 sm:px-0">
      {/* Order Header Card */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {new Date(order.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={order.status as OrderStatus} size="md" />
          </div>
        </div>

        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Order Progress</h3>
            <div className="flex items-center justify-between gap-1 sm:gap-0">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                // Short labels for mobile
                const mobileLabels = ['Pending', 'Confirm', 'Prep', 'Delivery', 'Done'];

                return (
                  <div key={step.status} className="flex-1 flex flex-col items-center relative">
                    {/* Connector Line */}
                    {index > 0 && (
                      <div
                        className={`absolute left-0 top-3 sm:top-5 w-full h-0.5 sm:h-1 ${
                          isCompleted ? 'bg-green-500' : isCurrent ? 'bg-yellow-500' : 'bg-gray-200'
                        }`}
                        style={{ width: 'calc(100% - 1.5rem)', left: 'calc(-50% + 0.75rem)' }}
                      />
                    )}

                    {/* Icon Circle */}
                    <div className="relative z-10">
                      <div
                        className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-yellow-500 text-white shadow-lg sm:scale-110'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <StepIcon className="w-3 h-3 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    {/* Label */}
                    <div className="mt-1 sm:mt-2 text-center w-full px-0.5">
                      <p
                        className={`text-[9px] sm:text-xs font-medium leading-tight truncate ${
                          isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        <span className="sm:hidden">{mobileLabels[index]}</span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Details</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-medium">Name:</span>{' '}
                {order.user.name || 'Not provided'}
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-medium">Phone:</span> {order.user.phone}
              </p>
            </div>
          </div>

          {/* Delivery Address Card */}
          {order.address && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delivery Address</h2>
              </div>
              <div className="text-sm sm:text-base text-gray-700 space-y-1">
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.postalCode}
                </p>
                {order.address.landmark && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    <span className="font-medium">Landmark:</span> {order.address.landmark}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Items Card */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      ₹{item.price} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm sm:text-base text-gray-900">
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
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Order Actions</h2>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        icon={CheckCircle}
                        onClick={() => handleStatusChange('CONFIRMED')}
                        isLoading={updating}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        Accept Order
                      </Button>
                      <Button
                        variant="danger"
                        icon={XCircle}
                        onClick={() => setShowCancelModal(true)}
                        disabled={updating}
                        className="w-full sm:w-auto"
                      >
                        Reject Order
                      </Button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <>
                      <Button
                        variant="primary"
                        icon={Utensils}
                        onClick={() => handleStatusChange('PREPARING')}
                        isLoading={updating}
                        className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                      >
                        Mark as Preparing
                      </Button>
                      <Button
                        variant="danger"
                        icon={XCircle}
                        onClick={() => setShowCancelModal(true)}
                        disabled={updating}
                        className="w-full sm:w-auto"
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                  {order.status === 'PREPARING' && (
                    <>
                      <Button
                        variant="primary"
                        icon={Truck}
                        onClick={() => handleStatusChange('READY_FOR_PICKUP')}
                        isLoading={updating}
                        className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                      >
                        <span className="hidden sm:inline">Mark as Ready for Pickup</span>
                        <span className="sm:hidden">Ready for Pickup</span>
                      </Button>
                      <Button
                        variant="danger"
                        icon={XCircle}
                        onClick={() => setShowCancelModal(true)}
                        disabled={updating}
                        className="w-full sm:w-auto"
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
                {order.status === 'READY_FOR_PICKUP' && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      Order is ready for pickup. Waiting for a delivery partner to accept...
                    </p>
                  </div>
                )}
              </div>
            )}

          {order.status === 'OUT_FOR_DELIVERY' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start sm:items-center gap-2">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs sm:text-sm text-orange-800 font-medium">
                    Order is out for delivery. The delivery partner will mark it as delivered.
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.status === 'CANCELLED' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-red-800 font-medium">
                      This order has been cancelled.
                    </p>
                    {order.cancelledAt && (
                      <p className="text-xs text-red-700 mt-1">
                        Cancelled on {new Date(order.cancelledAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {order.status === 'DELIVERED' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start sm:items-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-green-800 font-medium">
                      Order has been successfully delivered.
                    </p>
                    {order.deliveredAt && (
                      <p className="text-xs text-green-700 mt-1">
                        Delivered on {new Date(order.deliveredAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Your Earnings - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Your Earnings</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Items Subtotal</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹{order.subtotal}</p>
              </div>

              <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{order.subtotal}</p>
                <p className="text-xs text-gray-500 mt-2">
                  You receive 100% of your menu item prices
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-2">
              <p className="text-xs sm:text-sm text-gray-700">
                <span className="font-medium">Payment Method:</span>{' '}
                {order.paymentMethod}
              </p>
              {order.payment && (
                <p className="text-xs sm:text-sm">
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

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {order.status === 'PENDING' ? 'Reject Order' : 'Cancel Order'}
              </h3>
            </div>

            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Are you sure you want to {order.status === 'PENDING' ? 'reject' : 'cancel'} order #{order.orderNumber}? This action cannot be undone.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={updating}
                className="w-full sm:flex-1 order-2 sm:order-1"
              >
                Keep Order
              </Button>
              <Button
                variant="danger"
                icon={XCircle}
                onClick={handleCancelOrder}
                isLoading={updating}
                className="w-full sm:flex-1 order-1 sm:order-2"
              >
                {order.status === 'PENDING' ? 'Reject' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
