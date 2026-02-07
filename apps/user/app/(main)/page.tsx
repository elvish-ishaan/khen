'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, User, ChevronRight, Menu, X, Home, ShoppingBag, LogOut } from 'lucide-react';
import { restaurantsApi, type Restaurant } from '@/lib/api/restaurants.api';
import { useLocationStore } from '@/stores/location-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FoodCategorySection } from '@/components/home/food-category-section';
import { BestSellerSection } from '@/components/home/best-seller-section';
import { PromotionalBanner } from '@/components/home/promotional-banner';
import { RecommendSection } from '@/components/home/recommend-section';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { coordinates, permissionGranted, requestLocation, error: locationError } = useLocationStore();

  // Auto-request location on mount if not already granted
  useEffect(() => {
    if (!coordinates && !permissionGranted && !locationError) {
      requestLocation();
    }
  }, []);

  // Fetch cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Fetch restaurants when coordinates change
  useEffect(() => {
    fetchRestaurants();
  }, [coordinates]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = coordinates
        ? {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }
        : {};

      const response = await restaurantsApi.getRestaurants(params);

      if (response.success && response.data) {
        setRestaurants(response.data.restaurants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Navigate to search results page with query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Hero Section with Yellow Background */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 px-4 pt-4 pb-8 rounded-b-[2rem] shadow-lg relative">
        {/* Logo and Menu Button */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-2xl md:text-3xl font-bold text-white">
            Khen
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Top Bar with Icons */}
        <div className="flex items-center justify-between mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-4 pr-12 py-3 rounded-full text-sm bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
            <Link
              href="/cart"
              className="bg-white p-2 sm:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all relative"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="hidden sm:block bg-white p-2.5 rounded-full shadow-md hover:shadow-lg transition-all">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              className="bg-white p-2 sm:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </Link>
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            {getGreeting()}
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            {user?.name ? `${user.name}, ready for ` : 'Rise And Shine! It\'s '}
            {new Date().getHours() < 11 ? 'Breakfast' : new Date().getHours() < 15 ? 'Lunch' : 'Dinner'} Time
          </p>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top">
            <nav className="flex flex-col">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors border-b border-gray-100"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors border-b border-gray-100"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Orders</span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors border-b border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Cart</span>
                    {itemCount > 0 && (
                      <span className="ml-auto bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors border-b border-gray-100"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>

                  <Link
                    href="/profile/addresses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors border-b border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Addresses</span>
                  </Link>

                  <Link
                    href="/profile/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors border-b border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">Favorites</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Location Permission Banner */}
      {locationError && !coordinates && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-amber-900 text-sm">
                Location permission denied
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Enable location to see nearby restaurants
              </p>
            </div>
            <button
              onClick={requestLocation}
              className="bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700 text-xs whitespace-nowrap ml-4"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Food Categories */}
      <FoodCategorySection />

      {/* Best Seller Section */}
      <BestSellerSection
        restaurants={[...restaurants]
          .sort((a, b) => {
            // Sort by rating × totalReviews (weighted score)
            const scoreA = a.rating * a.totalReviews;
            const scoreB = b.rating * b.totalReviews;
            return scoreB - scoreA;
          })
          .slice(0, 5)}
        isLoading={isLoading}
      />

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Recommend Section */}
      <RecommendSection
        restaurants={restaurants}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
