'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, ShoppingBag } from 'lucide-react';
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
    isLoading,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-lg mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400 px-4 py-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ShoppingBag className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Your cart is empty
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Add delicious items to get started!
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-yellow-600 px-8 py-4 rounded-full hover:bg-yellow-50 font-bold text-lg shadow-xl transition-all hover:scale-105"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Item Count */}
        <p className="text-gray-700 text-lg mb-6">
          You have <span className="font-bold text-gray-900">{itemCount}</span>{' '}
          {itemCount === 1 ? 'item' : 'items'} in the cart
        </p>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 items-center">
                {/* Item Image */}
                <div className="flex-shrink-0">
                  {item.menuItem.imageUrl ? (
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold text-base mb-1">
                    {item.menuItem.name}
                  </h3>
                  <p className="text-gray-900 font-bold text-lg">
                    ₹{item.menuItem.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      item.quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, item.quantity - 1)
                    }
                    className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-all font-bold border border-yellow-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-gray-900 font-bold min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-all font-bold border border-yellow-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-yellow-500 text-gray-900 py-4 rounded-full hover:bg-yellow-600 font-bold text-lg shadow-lg transition-all hover:scale-105"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
