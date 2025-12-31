import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Subscription fetch error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
