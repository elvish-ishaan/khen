'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    itemCount,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Your cart is empty
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Add items from restaurants to get started
          </p>
          <Link
            href="/"
            className="inline-block bg-yellow-500 text-gray-900 px-6 py-3 rounded-md hover:bg-yellow-600 font-medium"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = cart.restaurant.deliveryFee;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <Link
              href={`/restaurant/${cart.restaurant.slug}`}
              className="flex items-center gap-4 hover:opacity-80"
            >
              {cart.restaurant.imageUrl && (
                <img
                  src={cart.restaurant.imageUrl}
                  alt={cart.restaurant.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {cart.restaurant.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {cart.restaurant.estimatedDeliveryTime} mins
                </p>
              </div>
            </Link>
          </div>

          {/* Cart Items */}
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-4 flex gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.menuItem.name}
                </h3>
                <p className="text-gray-600 mb-2">
                  ₹{item.menuItem.price} × {item.quantity}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      item.quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, item.quantity - 1)
                    }
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-red-400 hover:text-red-600 transition-colors"
                    title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      '-'
                    )}
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
                <p className="font-bold text-gray-900">
                  ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bill Details
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Item Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
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

            {subtotal < cart.restaurant.minOrderAmount && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm mb-4">
                Add ₹{(cart.restaurant.minOrderAmount - subtotal).toFixed(2)} more to
                meet minimum order
              </div>
            )}

            <button
              onClick={() => router.push('/checkout')}
              disabled={subtotal < cart.restaurant.minOrderAmount}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-md hover:bg-yellow-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
