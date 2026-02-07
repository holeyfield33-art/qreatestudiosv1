import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applyRateLimit } from '@/lib/middleware/rate-limit'
import { applySecurityHeaders } from '@/lib/security-headers'

// Force Node.js runtime instead of Edge
export const runtime = 'nodejs'

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
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/auth/signin') {
    const rateLimitResponse = await applyRateLimit(request, 'authSignIn')
    if (rateLimitResponse) return rateLimitResponse
  }

  if (pathname === '/api/qr/verify-password') {
    const rateLimitResponse = await applyRateLimit(request, 'verifyPassword')
    if (rateLimitResponse) return rateLimitResponse
  }

  if (pathname.startsWith('/api/ai/')) {
    const rateLimitResponse = await applyRateLimit(request, 'ai')
    if (rateLimitResponse) return rateLimitResponse
  }

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Allow public API paths
  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Allow short code redirects (single path segment)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 1 && !pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Allow menu, payment, and landing page routes
  if (pathname.startsWith('/menu/') || pathname.startsWith('/pay/') || pathname.startsWith('/l/')) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Check authentication for protected routes
  const session = await auth()

  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return applySecurityHeaders(NextResponse.redirect(signInUrl))
  }

  // Note: Ban checking should be done in API routes or page components, not middleware
  // Middleware should be lightweight and not make database calls

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
