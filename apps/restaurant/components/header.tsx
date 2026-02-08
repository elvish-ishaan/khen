'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, Store, Package, Utensils, Settings, LogOut, ArrowLeft } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { owner, isAuthenticated, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/dashboard/orders') return 'Orders';
    if (pathname?.startsWith('/dashboard/orders/')) return 'Order Details';
    if (pathname === '/dashboard/menu') return 'Menu';
    if (pathname === '/dashboard/settings') return 'Settings';
    return '';
  };

  const showBackButton = pathname !== '/dashboard';
  const pageTitle = getPageTitle();

  // Check if link is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

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
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              Khen
            </Link>
            {pageTitle && (
              <span className="text-white text-lg font-semibold hidden sm:block">
                / {pageTitle}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/orders"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard/orders')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Orders</span>
              </Link>

              <Link
                href="/dashboard/menu"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard/menu')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Menu</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard/settings')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              {/* Desktop Account Dropdown */}
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 text-white hover:text-yellow-100 font-medium transition-colors bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden xl:block">{owner?.name || 'Account'}</span>
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-yellow-200">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 lg:hidden">
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
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden border-t border-yellow-400/30 py-3 mt-2">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Store className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/orders"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard/orders')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Orders</span>
              </Link>

              <Link
                href="/dashboard/menu"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard/menu')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Utensils className="w-5 h-5" />
                <span>Menu</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard/settings')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-left text-white bg-red-500/90 hover:bg-red-500 font-medium py-2.5 px-3 rounded-lg transition-colors mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
