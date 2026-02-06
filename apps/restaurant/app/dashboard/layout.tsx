'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { owner, logout } = useAuthStore();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
    { href: '/dashboard/menu', label: 'Menu', icon: '🍽️' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-xl font-bold text-yellow-600">Khen Restaurant</h1>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-colors
                      ${
                        isActive(item.href)
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {owner && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {owner.name || 'Restaurant Owner'}
                  </p>
                  <p className="text-xs text-gray-500">{owner.phone}</p>
                </div>
              )}

              <button
                onClick={logout}
                className="text-gray-700 hover:text-red-600 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-1 pb-3 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                  ${
                    isActive(item.href)
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }
                `}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
