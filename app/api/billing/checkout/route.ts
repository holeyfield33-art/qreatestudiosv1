export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { handleApiError } from '@/lib/api-helpers';
import { createCheckoutSession } from '@/lib/services/stripe-service';
import { getBaseUrl } from '@/lib/utils/urls';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { plan } = body;

  if (!plan) {
    return NextResponse.json({ error: 'Plan required' }, { status: 400 });
  }

  const priceIds: Record<string, string> = {
    PRO: process.env.STRIPE_PRO_PRICE_ID!,
    BUSINESS: process.env.STRIPE_BUSINESS_PRICE_ID!,
    AGENCY: process.env.STRIPE_AGENCY_PRICE_ID!,
  };

  const priceId = priceIds[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  try {
    const baseUrl = getBaseUrl();
    const checkoutSession = await createCheckoutSession(
      session.user.id,
      priceId,
      `${baseUrl}/dashboard/billing?success=true`,
      `${baseUrl}/dashboard/billing?canceled=true`
    );

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (error: unknown) {
    return handleApiError(error, 'billing/checkout');
  }
}
