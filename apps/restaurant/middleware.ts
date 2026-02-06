import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('restaurant_auth_token');

  // Public paths that don't require auth
  const publicPaths = ['/login', '/verify-otp'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Onboarding paths - require auth but are accessible during onboarding
  const onboardingPaths = ['/documents', '/bank-details', '/restaurant-info', '/menu', '/location'];
  const isOnboardingPath = onboardingPaths.some((path) => pathname.startsWith(path));

  // If authenticated and on login page or root, redirect to dashboard
  if (hasToken && (pathname === '/' || pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If not authenticated and trying to access protected route, redirect to login
  if (!hasToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
