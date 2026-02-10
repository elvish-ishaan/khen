'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getRedirectPath, type OnboardingStatus } from '@/lib/onboarding-routes';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const personnel = useAuthStore((state) => state.personnel);
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

  // Handle redirects based on onboarding status
  useEffect(() => {
    if (!initialized || isLoading) return;

    const status = personnel?.onboardingStatus as OnboardingStatus | undefined;
    const redirectPath = getRedirectPath(status, pathname);

    if (redirectPath) {
      console.log(`🔄 Redirecting from ${pathname} to ${redirectPath} (status: ${status})`);
      router.replace(redirectPath);
    }
  }, [initialized, isLoading, personnel, pathname, router]);

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
