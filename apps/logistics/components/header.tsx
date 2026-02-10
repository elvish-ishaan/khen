'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, LayoutDashboard, Package, Truck, DollarSign, User, LogOut, ArrowLeft } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { personnel, logout } = useAuthStore();

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
    if (pathname === '/dashboard/deliveries') return 'Deliveries';
    if (pathname?.startsWith('/dashboard/deliveries/')) return 'Delivery Details';
    if (pathname === '/dashboard/orders') return 'Orders';
    if (pathname === '/dashboard/earnings') return 'Earnings';
    if (pathname === '/dashboard/profile') return 'Profile';
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
            <Link href="/dashboard" className="flex items-center">
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
          {personnel && (
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard') && pathname === '/dashboard'
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/deliveries"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard/deliveries')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Deliveries</span>
              </Link>

              <Link
                href="/dashboard/orders"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard/orders')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Orders</span>
              </Link>

              <Link
                href="/dashboard/earnings"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive('/dashboard/earnings')
                    ? 'bg-yellow-50 text-yellow-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Earnings</span>
              </Link>

              {/* Desktop Account Dropdown */}
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 text-white hover:text-yellow-100 font-medium transition-colors bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:block">{personnel?.name || personnel?.phone || 'Account'}</span>
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 border border-yellow-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{personnel?.name || 'Delivery Partner'}</p>
                      <p className="text-xs text-gray-500">{personnel?.phone}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
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
          {personnel && (
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
        {mobileMenuOpen && personnel && (
          <div className="lg:hidden border-t border-yellow-400/30 py-3 mt-2">
            <nav className="flex flex-col space-y-2">
              {/* User Info */}
              <div className="px-3 py-2 mb-2 bg-white/10 rounded-lg">
                <p className="text-sm font-medium text-white">{personnel?.name || 'Delivery Partner'}</p>
                <p className="text-xs text-yellow-100">{personnel?.phone}</p>
              </div>

              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard') && pathname === '/dashboard'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/deliveries"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard/deliveries')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Deliveries</span>
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
                <Truck className="w-5 h-5" />
                <span>Orders</span>
              </Link>

              <Link
                href="/dashboard/earnings"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard/earnings')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Earnings</span>
              </Link>

              <Link
                href="/dashboard/profile"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard/profile')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
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
