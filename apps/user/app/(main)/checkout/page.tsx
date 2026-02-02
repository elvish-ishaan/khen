'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { addressesApi, type Address } from '@/lib/api/addresses.api';
import { ordersApi } from '@/lib/api/orders.api';
import { paymentsApi } from '@/lib/api/payments.api';
import { cartApi } from '@/lib/api/cart.api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH_ON_DELIVERY'>('RAZORPAY');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Delivery fee calculation state
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryDistance, setDeliveryDistance] = useState<string>('');
  const [deliveryDuration, setDeliveryDuration] = useState<string>('');
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [feeError, setFeeError] = useState<string>('');

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchAddresses = async () => {
    try {
      const response = await addressesApi.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data.addresses);
        // Auto-select default address
        const defaultAddress = response.data.addresses.find((a) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (response.data.addresses.length > 0) {
          setSelectedAddressId(response.data.addresses[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const calculateDeliveryFeeForAddress = async (addressId: string) => {
    if (!cart) return;

    setIsCalculatingFee(true);
    setFeeError('');

    try {
      const response = await cartApi.calculateDeliveryFee({ addressId });

      if (response.success && response.data) {
        setDeliveryFee(response.data.deliveryFee);
        setDeliveryDistance(response.data.distanceText);
        setDeliveryDuration(response.data.durationText);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to calculate delivery fee';
      setFeeError(errorMsg);
      // Fallback to static fee
      setDeliveryFee(cart?.restaurant.deliveryFee || 0);
      setDeliveryDistance('');
      setDeliveryDuration('');
    } finally {
      setIsCalculatingFee(false);
    }
  };

  // Calculate delivery fee when address changes
  useEffect(() => {
    if (selectedAddressId && cart) {
      calculateDeliveryFeeForAddress(selectedAddressId);
    }
  }, [selectedAddressId, cart?.id]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    if (!cart) {
      setError('Cart is empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create order
      const orderResponse = await ordersApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        deliveryInstructions: deliveryInstructions || undefined,
      });

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      const order = orderResponse.data.order;

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        // Redirect to order confirmation
        router.push(`/orders/${order.id}`);
        return;
      }

      // Handle Razorpay payment
      const paymentOrderResponse = await paymentsApi.createPaymentOrder({
        orderId: order.id,
      });

      if (!paymentOrderResponse.success || !paymentOrderResponse.data) {
        throw new Error('Failed to create payment order');
      }

      const { razorpayOrderId, amount } = paymentOrderResponse.data;

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Khen Food Delivery',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await paymentsApi.verifyPayment({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              router.push(`/orders/${order.id}`);
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed');
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setError('Payment cancelled');
          },
        },
        theme: {
          color: '#2563EB',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setIsLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Delivery Address
              </h2>
              <button
                onClick={() => router.push('/profile/addresses?redirect=/checkout')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No addresses found</p>
                <button
                  onClick={() => router.push('/profile/addresses?redirect=/checkout')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                        {address.landmark && `, ${address.landmark}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Method
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    Pay Online (Razorpay)
                  </div>
                  <div className="text-sm text-gray-600">
                    Credit/Debit Card, UPI, Net Banking
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <input
                  type="radio"
                  name="payment"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    Cash on Delivery
                  </div>
                  <div className="text-sm text-gray-600">
                    Pay when you receive
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delivery Instructions (Optional)
            </h2>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g., Ring the doorbell, Call on arrival, etc."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Items ({cart.items.length})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <div className="flex flex-col">
                  <span>Delivery Fee</span>
                  {deliveryDistance && !isCalculatingFee && (
                    <span className="text-xs text-gray-500 mt-1">
                      {deliveryDistance} • {deliveryDuration}
                    </span>
                  )}
                  {feeError && (
                    <span className="text-xs text-red-500 mt-1">
                      Using estimated fee
                    </span>
                  )}
                </div>
                <span>
                  {isCalculatingFee ? (
                    <span className="text-gray-500">Calculating...</span>
                  ) : (
                    `₹${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Taxes (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-3 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddressId}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
