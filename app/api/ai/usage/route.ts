import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserTokenUsage, checkTokenLimit } from '@/lib/services/ai-usage-service';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await getUserTokenUsage(session.user.id, startOfMonth);

    // Get subscription plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const plan = subscription?.plan || 'FREE';
    const tokenCheck = await checkTokenLimit(session.user.id, plan);

    return NextResponse.json({
      usage,
      limit: tokenCheck.limit,
      remaining: tokenCheck.remaining,
      plan,
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
