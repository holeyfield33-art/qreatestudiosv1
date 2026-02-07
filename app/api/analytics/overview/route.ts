export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserAnalytics } from '@/lib/services/analytics-service';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const analytics = await getUserAnalytics(session.user.id);
    return NextResponse.json(analytics);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
