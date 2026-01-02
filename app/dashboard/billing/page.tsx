'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { PLAN_LIMITS } from '@/lib/services/stripe-service';

const PLAN_PRICES: Record<string, number> = {
  PRO: 29,
  BUSINESS: 79,
  AGENCY: 249,
};

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check for success/cancel params
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');

    if (success === 'true') {
      toast.success('Subscription activated successfully!');
      router.replace('/dashboard/billing');
    } else if (canceled === 'true') {
      toast.error('Checkout canceled');
      router.replace('/dashboard/billing');
    }

    fetchBillingInfo();
  }, []);

  async function fetchBillingInfo() {
    try {
      const [subRes, limitsRes] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/limits'),
      ]);

      const subData = await subRes.json();
      const limitsData = await limitsRes.json();

      if (subData.success) {
        setSubscription(subData.subscription);
      }
      if (limitsData.success) {
        setLimits(limitsData);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load billing info:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(plan: string) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
        setActionLoading(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Checkout error:', error);
      }
      toast.error('An error occurred');
      setActionLoading(false);
    }
  }

  async function handleManageSubscription() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal');
        setActionLoading(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Portal error:', error);
      }
      toast.error('An error occurred');
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'FREE';
  const planLimits = PLAN_LIMITS[currentPlan];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and usage limits
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">{currentPlan} Plan</h3>
              <Badge 
                variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}
              >
                {subscription?.status || 'FREE'}
              </Badge>
            </div>
            
            {currentPlan !== 'FREE' && (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  ${PLAN_PRICES[currentPlan]}/month
                </p>
                {subscription?.currentPeriodEnd && (
                  <p>
                    Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <p className="text-orange-600 font-medium">
                    ⚠️ Cancels at period end
                  </p>
                )}
              </div>
            )}
          </div>

          {currentPlan !== 'FREE' && subscription?.stripeCustomerId && (
            <Button 
              onClick={handleManageSubscription}
              disabled={actionLoading}
              variant="outline"
              className="min-h-[44px]"
            >
              Manage Subscription
            </Button>
          )}
        </div>
      </Card>

      {/* Usage Stats */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Current Usage</h3>
        
        <div className="space-y-4">
          {/* QR Codes */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">QR Codes</span>
              <span className="text-sm text-muted-foreground">
                {limits?.qrCodes?.current || 0} / {planLimits.qrCodes === -1 ? '∞' : planLimits.qrCodes}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: planLimits.qrCodes === -1 
                    ? '0%' 
                    : `${Math.min((limits?.qrCodes?.current / planLimits.qrCodes) * 100, 100)}%`
                }}
                role="progressbar"
                aria-valuenow={limits?.qrCodes?.current || 0}
                aria-valuemin={0}
                aria-valuemax={planLimits.qrCodes === -1 ? 100 : planLimits.qrCodes}
              ></div>
            </div>
          </div>

          {/* AI Tokens */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">AI Tokens (Monthly)</span>
              <span className="text-sm text-muted-foreground">
                {(limits?.aiTokens?.used || 0).toLocaleString()} / {planLimits.aiTokens.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((limits?.aiTokens?.used / planLimits.aiTokens) * 100, 100)}%`
                }}
                role="progressbar"
                aria-valuenow={limits?.aiTokens?.used || 0}
                aria-valuemin={0}
                aria-valuemax={planLimits.aiTokens}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Plan Features</h3>
        <ul className="space-y-2" role="list" aria-label="Current plan features">
          {planLimits.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Upgrade Options */}
      {currentPlan !== 'AGENCY' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Upgrade Your Plan</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {['PRO', 'BUSINESS', 'AGENCY']
              .filter(plan => {
                const order = ['FREE', 'PRO', 'BUSINESS', 'AGENCY'];
                return order.indexOf(plan) > order.indexOf(currentPlan);
              })
              .map((plan) => {
                const limits = PLAN_LIMITS[plan];
                return (
                  <div key={plan} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{plan}</h4>
                    <p className="text-2xl font-bold mb-3">
                      ${PLAN_PRICES[plan]}<span className="text-sm font-normal">/mo</span>
                    </p>
                    <ul className="space-y-1 mb-4 text-sm">
                      <li>
                        {limits.qrCodes === -1 ? 'Unlimited' : limits.qrCodes} QR codes
                      </li>
                      <li>{(limits.aiTokens / 1000).toFixed(0)}k AI tokens</li>
                    </ul>
                    <Button
                      onClick={() => handleUpgrade(plan)}
                      disabled={actionLoading}
                      className="w-full min-h-[44px]"
                    >
                      Upgrade to {plan}
                    </Button>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}
