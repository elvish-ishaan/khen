'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function HomePage() {
  const router = useRouter();
  const { owner, fetchOwner, isLoading } = useAuthStore();

  useEffect(() => {
    const redirectUser = async () => {
      // Fetch owner data to check onboarding status
      await fetchOwner();
    };

    redirectUser();
  }, [fetchOwner]);

  useEffect(() => {
    // Once owner data is loaded, redirect based on onboarding status
    if (!isLoading && owner) {
      const status = owner.onboardingStatus;

      if (status === 'COMPLETED') {
        router.push('/dashboard');
      } else if (status === 'PENDING_DOCUMENTS') {
        router.push('/documents');
      } else if (status === 'PENDING_BANK_DETAILS') {
        router.push('/bank-details');
      } else if (status === 'PENDING_MENU') {
        router.push('/restaurant-info');
      } else if (status === 'PENDING_LOCATION') {
        router.push('/menu');
      } else {
        // Default to first step if status is unknown
        router.push('/documents');
      }
    }
  }, [owner, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4 animate-pulse">
          <span className="text-2xl font-bold text-gray-900">K</span>
        </div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
