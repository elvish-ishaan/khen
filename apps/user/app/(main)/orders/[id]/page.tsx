'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, MapPin, Phone, Store, Check, Clock, Utensils, Bike, CheckCircle, XCircle } from 'lucide-react';
import { ordersApi, type Order } from '@/lib/api/orders.api';
import { ReviewForm } from '@/components/restaurant/review-form';
import { StarRating } from '@/components/restaurant/star-rating';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { key: 'PREPARING', label: 'Preparing', icon: Utensils },
    { key: 'READY_FOR_PICKUP', label: 'Ready', icon: Package },
    { key: 'OUT_FOR_DELIVERY', label: 'On the way', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', icon: Check },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600">
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
              className="bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-full hover:bg-yellow-600 font-semibold transition-all hover:scale-105 shadow-md"
            >
              Reorder
            </button>
          </div>

          {/* Restaurant Info */}
          {order.restaurant && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <div className="bg-yellow-100 p-2.5 rounded-full">
                <Store className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{order.restaurant.name}</p>
                {order.restaurant.phone && (
                  <a
                    href={`tel:${order.restaurant.phone}`}
                    className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {order.restaurant.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Status */}
        {order.status !== 'CANCELLED' ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute top-5 left-0 h-1 bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / statusSteps.length}%` }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? isCurrent
                              ? 'bg-yellow-500 text-white shadow-lg scale-110'
                              : 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs text-center mt-2 font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Order Cancelled</h3>
                <p className="text-sm text-red-700">This order has been cancelled</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                </div>

                <div className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <p className="font-semibold mb-2">{order.address.label}</p>
                  <p className="text-sm">{order.address.addressLine1}</p>
                  {order.address.addressLine2 && (
                    <p className="text-sm">{order.address.addressLine2}</p>
                  )}
                  {order.address.landmark && (
                    <p className="text-sm text-gray-600 mt-1">
                      Near: {order.address.landmark}
                    </p>
                  )}
                  <p className="text-sm mt-1">
                    {order.address.city}, {order.address.state} - {order.address.postalCode}
                  </p>
                </div>
              </div>
            )}

            {/* Review Section */}
            {order.status === 'DELIVERED' && (
              <div>
                {order.review || reviewSubmitted ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Your Review</h2>
                    {order.review && (
                      <div className="bg-yellow-50 p-4 rounded-xl">
                        <StarRating rating={order.review.rating} size="md" readonly />
                        {order.review.comment && (
                          <p className="text-gray-700 mt-3">{order.review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-3">
                          {new Date(order.review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <ReviewForm
                    orderId={order.id}
                    restaurantName={order.restaurant?.name || 'this restaurant'}
                    onSuccess={() => {
                      setReviewSubmitted(true);
                      fetchOrder();
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Column - Bill Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bill Details</h3>

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

              <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-sm text-gray-600">
                  Payment Method
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {order.paymentMethod === 'RAZORPAY' ? 'Online Payment' : 'Cash on Delivery'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
