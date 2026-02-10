'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { requiresApproval, type OnboardingStatus, ONBOARDING_ROUTES } from '@/lib/onboarding-routes';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredStatus?: OnboardingStatus;
}

/**
 * Route guard component for protecting specific pages
 * Use this to wrap pages that require specific onboarding status
 *
 * @example
 * // In dashboard page:
 * export default function DashboardPage() {
 *   return (
 *     <RouteGuard requiredStatus="APPROVED">
 *       <div>Dashboard content</div>
 *     </RouteGuard>
 *   );
 * }
 */
export function RouteGuard({ children, requiredStatus = 'APPROVED' }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const personnel = useAuthStore((state) => state.personnel);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!personnel) {
      router.replace('/login');
      return;
    }

    const currentStatus = personnel.onboardingStatus as OnboardingStatus;

    // Check if user has required status
    if (currentStatus !== requiredStatus) {
      const redirectPath = ONBOARDING_ROUTES[currentStatus];
      console.log(
        `⚠️ Access denied to ${pathname}. Required: ${requiredStatus}, Current: ${currentStatus}. Redirecting to ${redirectPath}`
      );
      router.replace(redirectPath);
    }
  }, [personnel, isLoading, requiredStatus, pathname, router]);

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or wrong status
  if (!personnel || personnel.onboardingStatus !== requiredStatus) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Simple dashboard guard - requires APPROVED status
 * Use this for all dashboard pages
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  return <RouteGuard requiredStatus="APPROVED">{children}</RouteGuard>;
}
