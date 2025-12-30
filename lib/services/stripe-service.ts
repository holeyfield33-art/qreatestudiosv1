import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export interface PlanLimits {
  qrCodes: number;
  aiTokens: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    qrCodes: 3,
    aiTokens: 10_000,
    features: ['Basic QR codes', 'Analytics', 'Menu builder'],
  },
  PRO: {
    qrCodes: 50,
    aiTokens: 100_000,
    features: [
      'All Free features',
      'Custom domains',
      'Advanced analytics',
      'AI tools',
      'Print orders',
    ],
  },
  BUSINESS: {
    qrCodes: -1, // Unlimited
    aiTokens: 500_000,
    features: [
      'All Pro features',
      'Unlimited QR codes',
      'Priority support',
      'CRM',
      'Team collaboration',
    ],
  },
  AGENCY: {
    qrCodes: -1, // Unlimited
    aiTokens: 1_000_000,
    features: [
      'All Business features',
      'White-label',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
};

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export { stripe };
