'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, ShoppingCart, User, ArrowLeft, Bell } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  const getPageTitle = () => {
    if (pathname === '/cart') return 'Cart';
    if (pathname === '/orders') return 'Orders';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/profile/addresses') return 'Addresses';
    if (pathname === '/profile/favorites') return 'Favorites';
    if (pathname === '/checkout') return 'Checkout';
    if (pathname?.startsWith('/orders/')) return 'Order Details';
    if (pathname?.startsWith('/restaurant/')) return 'Menu';
    return '';
  };

  const showBackButton = pathname !== '/';
  const pageTitle = getPageTitle();

  return (
    <header className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Back Button or Logo */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={() => router.back()}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            ) : null}
            <Link href="/" className="flex items-center">
              <Image
                src="https://res.cloudinary.com/diqurtmad/image/upload/v1770539638/black_dawat-removebg-preview_bppqvz.png"
                alt="Daavat Logo"
                width={130}
                height={45}
                className="h-10 md:h-12 w-auto object-contain"
                priority
              />
            </Link>
            {pageTitle && (
              <span className="text-white text-lg font-semibold hidden sm:block">
                / {pageTitle}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link
              href="/"
              className="text-white hover:text-yellow-100 font-medium transition-colors"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  className="text-white hover:text-yellow-100 font-medium transition-colors"
                >
                  Orders
                </Link>

                <Link
                  href="/cart"
                  className="relative text-white hover:text-yellow-100 font-medium transition-colors flex items-center gap-1"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Desktop Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 text-white hover:text-yellow-100 font-medium transition-colors bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:block">{user?.name || 'Account'}</span>
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-yellow-200">
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
                className="bg-white text-yellow-600 px-4 py-2 rounded-full hover:bg-yellow-50 font-medium transition-colors shadow-md"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button + Icons */}
          <div className="flex items-center gap-3 lg:hidden">
            {isAuthenticated && (
              <>
                <Link href="/cart" className="relative text-white">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <button className="text-white">
                  <Bell className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-yellow-100 transition-colors bg-white/20 hover:bg-white/30 p-1.5 rounded-full"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-yellow-400/30 py-3 mt-2">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="text-white hover:bg-white/20 font-medium py-2.5 px-3 rounded-lg transition-colors"
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="text-white hover:bg-white/20 font-medium py-2.5 px-3 rounded-lg transition-colors"
                  >
                    Orders
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeMobileMenu}
                    className="text-white hover:bg-white/20 font-medium py-2.5 px-3 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Cart</span>
                    {itemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="text-white hover:bg-white/20 font-medium py-2.5 px-3 rounded-lg transition-colors"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/profile/addresses"
                    onClick={closeMobileMenu}
                    className="text-white hover:bg-white/20 font-medium py-2.5 px-3 rounded-lg transition-colors"
                  >
                    Addresses
                  </Link>

                  <Link
                    href="/profile/favorites"
                    onClick={closeMobileMenu}
                    className="text-white hover:bg-white/20 font-medium py-2.5 px-3 rounded-lg transition-colors"
                  >
                    Favorites
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left text-white bg-red-500/90 hover:bg-red-500 font-medium py-2.5 px-3 rounded-lg transition-colors mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="bg-white text-yellow-600 text-center px-4 py-2.5 rounded-lg hover:bg-yellow-50 font-medium transition-colors shadow-md"
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
