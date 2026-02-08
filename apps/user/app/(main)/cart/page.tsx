'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
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
      <div className="min-h-screen bg-white px-3 sm:px-4 py-4 sm:py-8">
        <div className="animate-pulse space-y-4 max-w-lg mx-auto">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 sm:w-1/2" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400 px-3 sm:px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Your cart is empty
          </h2>
          <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg">
            Add delicious items to get started!
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-yellow-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-yellow-50 font-bold text-base sm:text-lg shadow-xl transition-all hover:scale-105"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {/* Item Count */}
        <p className="text-gray-700 text-base sm:text-lg mb-4 sm:mb-6">
          You have <span className="font-bold text-gray-900">{itemCount}</span>{' '}
          {itemCount === 1 ? 'item' : 'items'} in the cart
        </p>

        {/* Cart Items */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3 sm:gap-4 items-start">
                {/* Item Image */}
                <div className="flex-shrink-0">
                  {item.menuItem.imageUrl ? (
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold text-base mb-1 break-words">
                    {item.menuItem.name}
                  </h3>
                  <p className="text-gray-900 font-bold text-lg">
                    ₹{item.menuItem.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
            </div>
          ))}
        </div>

        {/* Checkout Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">₹{subtotal.toFixed(2)}</p>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="flex-1 max-w-xs bg-yellow-500 text-gray-900 py-3 sm:py-4 rounded-full hover:bg-yellow-600 font-bold text-base sm:text-lg shadow-lg transition-all hover:scale-105"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
