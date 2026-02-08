import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/banned',
  '/legal/terms',
  '/legal/privacy',
  '/pricing',
]

const publicApiPaths = [
  '/api/auth',
  '/api/security/report',
  '/api/capabilities',
  '/api/health',
  '/api/ready',
]

/** Inline security headers — must be Edge-compatible (no Node.js imports) */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://api.stripe.com https://*.upstash.io https://*.vercel-storage.com; frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com https://www.google.com; object-src 'none'; base-uri 'self'"
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Allow public API paths
  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Allow short code redirects (single path segment, not dashboard or API)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 1 && !pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Allow menu, payment, and landing page routes (public)
  if (pathname.startsWith('/menu/') || pathname.startsWith('/pay/') || pathname.startsWith('/l/')) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Check authentication for protected routes
  const session = await auth()

  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return withSecurityHeaders(NextResponse.redirect(signInUrl))
  }

  return withSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
