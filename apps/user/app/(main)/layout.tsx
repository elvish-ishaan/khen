'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { useAuthStore } from '@/stores/auth-store';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth } = useAuthStore();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show header on all pages except homepage (homepage has its own integrated header) */}
      {!isHomePage && <Header />}
      <main>{children}</main>
    </div>
  );
}
