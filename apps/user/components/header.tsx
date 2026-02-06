'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
    router.push('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-yellow-600">
            Khen
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
                >
                  Orders
                </Link>

                <Link
                  href="/cart"
                  className="relative text-gray-700 hover:text-yellow-600 font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 inline-block mr-1" />
                  Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Desktop Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-yellow-600 font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    {user?.name || 'Account'}
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                      <Link
                        href="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/profile/addresses"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                      >
                        Addresses
                      </Link>
                      <Link
                        href="/profile/favorites"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                      >
                        Favorites
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-600 font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button + Cart Icon */}
          <div className="flex items-center gap-4 lg:hidden">
            {isAuthenticated && (
              <Link href="/cart" className="relative text-gray-700">
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-yellow-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-3 rounded-md transition-colors"
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Orders
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Cart {itemCount > 0 && `(${itemCount})`}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/profile/addresses"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Addresses
                  </Link>

                  <Link
                    href="/profile/favorites"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Favorites
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:bg-red-50 font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="bg-yellow-500 text-gray-900 text-center px-4 py-2 rounded-md hover:bg-yellow-600 font-medium transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
