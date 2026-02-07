export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkAICredits } from '@/lib/ai/qr-optimizer';

/**
 * GET /api/ai/credits
 * Get AI optimization credits for current user
 */
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const credits = await checkAICredits(session.user.id);

    return NextResponse.json({
      plan: credits.plan,
      limit: credits.limit,
      used: credits.used,
      remaining: credits.remaining,
      hasCredits: credits.hasCredits,
    });
  } catch (error) {
    console.error('Error fetching AI credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI credits' },
      { status: 500 }
    );
  }
}
