/**
 * Onboarding route mapping and utilities
 * Handles redirects based on delivery personnel onboarding status
 */

export type OnboardingStatus =
  | 'PENDING_DOCUMENTS'
  | 'PENDING_BANK_DETAILS'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

/**
 * Map onboarding status to the appropriate route
 */
export const ONBOARDING_ROUTES: Record<OnboardingStatus, string> = {
  PENDING_DOCUMENTS: '/documents',
  PENDING_BANK_DETAILS: '/bank-details',
  PENDING_REVIEW: '/pending-review',
  APPROVED: '/dashboard',
  REJECTED: '/pending-review', // Show rejection message on review page
};

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = ['/', '/login', '/verify-otp'];

/**
 * Onboarding routes that require auth but not approval
 */
export const ONBOARDING_ROUTES_LIST = [
  '/documents',
  '/bank-details',
  '/pending-review',
];

/**
 * Dashboard routes that require APPROVED status
 */
export const DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/orders',
  '/dashboard/deliveries',
  '/dashboard/profile',
  '/dashboard/earnings',
];

/**
 * Get the redirect path based on onboarding status
 */
export function getRedirectPath(
  status: OnboardingStatus | undefined,
  currentPath: string
): string | null {
  // Not authenticated - redirect to login
  if (!status) {
    if (PUBLIC_ROUTES.includes(currentPath)) {
      return null; // Already on public route
    }
    return '/login';
  }

  // Authenticated - redirect based on status
  const targetRoute = ONBOARDING_ROUTES[status];

  // Already on the correct route
  if (currentPath === targetRoute || currentPath.startsWith(targetRoute)) {
    return null;
  }

  // Special case: if on public routes and authenticated, redirect to appropriate page
  if (PUBLIC_ROUTES.includes(currentPath)) {
    return targetRoute;
  }

  // If trying to access dashboard without approval, redirect to onboarding page
  if (
    DASHBOARD_ROUTES.some((route) => currentPath.startsWith(route)) &&
    status !== 'APPROVED'
  ) {
    return targetRoute;
  }

  // If trying to access onboarding pages after approval, redirect to dashboard
  if (
    ONBOARDING_ROUTES_LIST.some((route) => currentPath.startsWith(route)) &&
    status === 'APPROVED'
  ) {
    return '/dashboard';
  }

  // If trying to access wrong onboarding page, redirect to correct one
  if (
    ONBOARDING_ROUTES_LIST.some((route) => currentPath.startsWith(route)) &&
    !currentPath.startsWith(targetRoute)
  ) {
    return targetRoute;
  }

  return null; // No redirect needed
}

/**
 * Check if a route requires APPROVED status
 */
export function requiresApproval(path: string): boolean {
  return DASHBOARD_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Check if a route is public (no auth required)
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path);
}
