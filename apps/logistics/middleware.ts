import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js middleware for route protection
 * Runs on the edge before the page is rendered
 *
 * Note: This middleware checks for auth cookie presence only.
 * Detailed onboarding status checks happen client-side in AuthInitializer.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/verify-otp'];

  // Check if current path is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if user has auth cookie
  const hasAuthCookie = request.cookies.has('logistics_auth_token');

  // If accessing public route and authenticated, no redirect here
  // (AuthInitializer will handle status-based redirect)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If accessing protected route without auth, redirect to login
  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // User is authenticated, allow access
  // (AuthInitializer will check onboarding status and redirect if needed)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
