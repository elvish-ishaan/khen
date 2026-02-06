'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3" />
          <div className="h-48 sm:h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm sm:text-base">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <button
          onClick={handleReorder}
          className="bg-yellow-500 text-gray-900 px-4 sm:px-6 py-2 rounded-md hover:bg-yellow-600 font-medium text-sm sm:text-base whitespace-nowrap"
        >
          Reorder
        </button>
      </div>

      {/* Order Status Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Order Status
          </h2>

          <div className="relative overflow-x-auto">
            <div className="flex justify-between min-w-max sm:min-w-0">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1 px-1 sm:px-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
                      index <= currentStepIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <p className="text-[10px] sm:text-xs text-center mt-1 sm:mt-2 text-gray-600 leading-tight">
                    {step.label}
                  </p>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute top-[14px] sm:top-4 h-0.5 ${
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 sm:mb-6 text-sm sm:text-base">
          This order has been cancelled
        </div>
      )}

      {/* Restaurant Contact - Show after restaurant confirms order */}
      {order.status !== 'PENDING' &&
        order.status !== 'CANCELLED' &&
        order.restaurant?.phone && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Restaurant Contact
            </h2>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Name:</span>
                <span className="text-xs sm:text-sm text-gray-900">{order.restaurant.name}</span>
              </div>
              {order.restaurant.addressLine1 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Address:
                  </span>
                  <span className="text-xs sm:text-sm text-gray-900">
                    {order.restaurant.addressLine1}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Phone:</span>
                <a
                  href={`tel:${order.restaurant.phone}`}
                  className="text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 hover:underline"
                >
                  {order.restaurant.phone}
                </a>
              </div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Order Items
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start py-2 sm:py-3 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Delivery Address
              </h2>
              <div className="text-gray-700">
                <p className="font-medium mb-1 text-sm sm:text-base">{order.address.label}</p>
                <p className="text-xs sm:text-sm">{order.address.addressLine1}</p>
                {order.address.addressLine2 && (
                  <p className="text-xs sm:text-sm">{order.address.addressLine2}</p>
                )}
                {order.address.landmark && (
                  <p className="text-xs sm:text-sm">Landmark: {order.address.landmark}</p>
                )}
                <p className="text-xs sm:text-sm">
                  {order.address.city}, {order.address.state} -{' '}
                  {order.address.postalCode}
                </p>
              </div>
            </div>
          )}

          {/* Review Section */}
          {order.status === 'DELIVERED' && (
            <div>
              {order.review || reviewSubmitted ? (
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Your Review
                  </h2>
                  {order.review && (
                    <div>
                      <StarRating
                        rating={order.review.rating}
                        size="md"
                        readonly
                      />
                      {order.review.comment && (
                        <p className="text-gray-700 mt-3 text-xs sm:text-sm leading-relaxed">
                          {order.review.comment}
                        </p>
                      )}
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-3">
                        Submitted on{' '}
                        {new Date(order.review.createdAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
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

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Bill Details
            </h3>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>Taxes</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm sm:text-base">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                <span>Total Paid</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
              <p className="text-xs sm:text-sm text-gray-600">
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
