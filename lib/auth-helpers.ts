import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Get session for API routes with proper error handling
 * NextAuth v5 beta requires special handling in API routes
 */
export async function getAuthSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error('Auth session error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated and return session or error response
 */
export async function requireAuth() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      ),
    };
  }
  
  return { session, error: null };
}
