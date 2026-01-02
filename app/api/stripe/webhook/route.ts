import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/services/stripe-service';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Webhook signature verification failed:', error.message);
    }
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          if (process.env.NODE_ENV === 'development') {
              console.error('No userId in checkout session');
    }
          break;
        }

        const stripeSubscription: any = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const plan = getPlanFromPriceId(stripeSubscription.items.data[0].price.id);

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status: 'ACTIVE' as const,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
          create: {
            id: randomUUID(),
            userId,
            plan,
            status: 'ACTIVE' as const,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            updatedAt: new Date(),
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.cancel_at_period_end ? ('CANCELED' as const) : ('ACTIVE' as const),
            currentPeriodStart: new Date((subscription.current_period_start as number) * 1000),
            currentPeriodEnd: new Date((subscription.current_period_end as number) * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED' as const,
            plan: 'FREE',
          },
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: invoice.customer },
          data: {
            status: 'PAST_DUE' as const,
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Webhook handler error:', error);
    }
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO';
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return 'BUSINESS';
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return 'AGENCY';
  return 'FREE';
}
