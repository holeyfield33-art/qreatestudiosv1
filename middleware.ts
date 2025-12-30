import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/legal/terms',
  '/legal/privacy',
]

const publicApiPaths = [
  '/api/auth',
  '/api/security/report',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow public API paths
  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow short code redirects (single path segment)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 1 && !pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow menu, payment, and landing page routes
  if (pathname.startsWith('/menu/') || pathname.startsWith('/pay/') || pathname.startsWith('/l/')) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const session = await auth()

  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if user is banned
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBanned: true, bannedReason: true },
  })

  if (user?.isBanned) {
    const bannedUrl = new URL('/auth/banned', request.url)
    return NextResponse.redirect(bannedUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
