'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [initialized, setInitialized] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      const initAuth = async () => {
        await fetchMe();
        setInitialized(true);
      };

      initAuth();
    }
  }, []); // Empty dependency array - only run once on mount

  // Show loading state while checking auth
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
