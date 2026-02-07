import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/auth';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out Qreate Studios',
    features: [
      '3 QR codes',
      '10k AI tokens/month',
      'Basic analytics',
      'Access to free templates',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
    planId: 'FREE',
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For individuals and small businesses',
    features: [
      '50 QR codes',
      '100k AI tokens/month',
      'Advanced analytics dashboard',
      'Export reports (PDF/CSV)',
      'Access to template library',
      'AI-powered optimization',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    planId: 'PRO',
  },
  {
    name: 'Business',
    price: 79,
    period: 'month',
    description: 'For growing businesses and teams',
    features: [
      'Unlimited QR codes',
      '500k AI tokens/month',
      'Advanced analytics dashboard',
      'Premium templates',
      'Comparative analytics',
      'Real-time dashboard',
      'AI optimization',
      'Team collaboration (5 seats)',
      'API access',
      'Phone support',
    ],
    cta: 'Start Business Trial',
    popular: false,
    planId: 'BUSINESS',
  },
  {
    name: 'Agency',
    price: 249,
    period: 'month',
    description: 'For agencies and enterprises',
    features: [
      'Everything in Business',
      'White-label platform',
      'Custom domain',
      'Remove Qreate branding',
      'Sub-account management',
      'Revenue sharing (70/30)',
      'Unlimited team seats',
      '1M AI tokens/month',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
    planId: 'AGENCY',
  },
];

export default async function PricingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16" role="list" aria-label="Pricing plans">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular
                  ? 'border-2 border-blue-600 shadow-xl'
                  : 'border border-gray-200'
              }`}
              role="listitem"
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-5xl font-bold" aria-label={`$${plan.price} per ${plan.period}`}>
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6" role="list" aria-label={`${plan.name} plan features`}>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {session?.user ? (
                <Link href={`/dashboard/billing?plan=${plan.planId}`}>
                  <Button
                    className="w-full min-h-[44px]"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button
                    className="w-full min-h-[44px]"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6" role="list" aria-label="Frequently asked questions">
            <div role="listitem">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                are prorated to ensure fair billing.
              </p>
            </div>

            <div role="listitem">
              <h3 className="font-semibold mb-2">What happens when I hit my limits?</h3>
              <p className="text-muted-foreground">
                You&apos;ll be notified when approaching limits. You can upgrade anytime
                or wait until next month&apos;s reset for continued access.
              </p>
            </div>

            <div role="listitem">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes! All paid plans include a 14-day free trial. No credit card
                required to start exploring features.
              </p>
            </div>

            <div role="listitem">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards via Stripe. Enterprise plans can
                arrange invoicing for larger organizations.
              </p>
            </div>

            <div role="listitem">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely. Cancel your subscription at any time with no cancellation
                fees. You&apos;ll have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button size="lg" className="min-h-[44px]">
            Contact Sales
          </Button>
        </div>
      </main>
    </div>
  );
}
