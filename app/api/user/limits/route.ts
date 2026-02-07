export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserLimits } from '@/lib/services/usage-enforcement';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const limits = await getUserLimits(session.user.id);

    return NextResponse.json({
      success: true,
      ...limits,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Limits fetch error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch limits' },
      { status: 500 }
    );
  }
}
