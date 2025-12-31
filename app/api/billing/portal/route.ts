import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createBillingPortalSession } from '@/lib/services/stripe-service';
import { getBaseUrl } from '@/lib/utils/urls';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }

    const baseUrl = getBaseUrl();
    const portalSession = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${baseUrl}/dashboard/billing`
    );

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Portal error:', error);
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
