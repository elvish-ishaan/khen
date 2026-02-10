'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const personnel = useAuthStore((state) => state.personnel);
  const isLoading = useAuthStore((state) => state.isLoading);

  // No need to call fetchMe here - auth initializer already handles it

  useEffect(() => {
    // Check onboarding status and redirect if needed
    if (personnel) {
      const status = personnel.onboardingStatus;

      if (!status || status === 'NOT_STARTED') {
        // Not started onboarding - redirect to documents
        router.push('/documents');
      } else if (status === 'PENDING') {
        // Under review - redirect to pending-review page
        router.push('/pending-review');
      }
      // If APPROVED, allow access (do nothing)
    }
  }, [personnel, router]);

  // Show loading while checking auth
  if (!personnel || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Block access if not approved
  if (personnel.onboardingStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render dashboard content for approved users
  return <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>;
}
