'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const paymentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  paymentProvider: z.enum(['CASHAPP', 'VENMO', 'ZELLE', 'PAYPAL', 'STRIPE', 'SQUARE']),
  paymentHandle: z.string().min(1, 'Payment handle is required'),
  paymentAmount: z.string().optional(),
  paymentCurrency: z.string(),
  paymentNote: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PROVIDER_INFO = {
  CASHAPP: {
    label: 'Cash App',
    handleLabel: 'Cash App $Cashtag',
    placeholder: '$username',
    helpText: 'Your Cash App cashtag (starts with $)',
  },
  VENMO: {
    label: 'Venmo',
    handleLabel: 'Venmo Username',
    placeholder: 'username',
    helpText: 'Your Venmo username (without @)',
  },
  ZELLE: {
    label: 'Zelle',
    handleLabel: 'Email or Phone',
    placeholder: 'email@example.com or +12345678900',
    helpText: 'Your Zelle email or phone number',
  },
  PAYPAL: {
    label: 'PayPal',
    handleLabel: 'PayPal.me Username',
    placeholder: 'username',
    helpText: 'Your PayPal.me username',
  },
  STRIPE: {
    label: 'Stripe',
    handleLabel: 'Stripe Payment Link',
    placeholder: 'https://buy.stripe.com/...',
    helpText: 'Full Stripe Payment Link URL',
  },
  SQUARE: {
    label: 'Square',
    handleLabel: 'Square Payment Link',
    placeholder: 'https://square.link/...',
    helpText: 'Full Square payment link URL',
  },
};

export default function CreatePaymentQRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      name: '',
      description: '',
      paymentProvider: 'CASHAPP',
      paymentHandle: '',
      paymentAmount: '',
      paymentCurrency: 'USD',
      paymentNote: '',
    },
  });

  const provider = watch('paymentProvider');
  const providerConfig = PROVIDER_INFO[provider];

  async function onSubmit(data: PaymentFormData) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        paymentAmount: data.paymentAmount ? parseFloat(data.paymentAmount) : undefined,
      };

      const res = await fetch('/api/qr/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Payment QR created!');
        router.push(`/dashboard/qr-codes/${result.qrCode.id}`);
      } else {
        toast.error(result.error || 'Failed to create payment QR');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Payment QR creation error:', error);
      }
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Create Payment QR</h1>
        <p className="text-muted-foreground">
          Accept payments via Cash App, Venmo, Zelle, and more
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* QR Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">QR Code Details</h3>
            
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Tip Jar"
                aria-required="true"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="mt-1.5"
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Optional description"
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Settings</h3>

            <div>
              <Label htmlFor="paymentProvider" className="text-sm font-medium">
                Payment Provider <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <select
                id="paymentProvider"
                {...register('paymentProvider')}
                aria-required="true"
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.entries(PROVIDER_INFO).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="paymentHandle" className="text-sm font-medium">
                {providerConfig.handleLabel} <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="paymentHandle"
                {...register('paymentHandle')}
                placeholder={providerConfig.placeholder}
                aria-required="true"
                aria-invalid={errors.paymentHandle ? 'true' : 'false'}
                aria-describedby={
                  errors.paymentHandle 
                    ? 'paymentHandle-error' 
                    : 'paymentHandle-help'
                }
                className="mt-1.5"
              />
              {errors.paymentHandle ? (
                <p id="paymentHandle-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.paymentHandle.message}
                </p>
              ) : (
                <p id="paymentHandle-help" className="text-sm text-muted-foreground mt-1">
                  {providerConfig.helpText}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentAmount" className="text-sm font-medium">
                Amount (optional)
              </Label>
              <div className="mt-1.5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('paymentAmount')}
                  placeholder="0.00"
                  className="pl-7"
                  aria-describedby="paymentAmount-help"
                />
              </div>
              <p id="paymentAmount-help" className="text-sm text-muted-foreground mt-1">
                Leave empty for any amount
              </p>
            </div>

            <div>
              <Label htmlFor="paymentCurrency" className="text-sm font-medium">
                Currency
              </Label>
              <select
                id="paymentCurrency"
                {...register('paymentCurrency')}
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <Label htmlFor="paymentNote" className="text-sm font-medium">
                Payment Note
              </Label>
              <Input
                id="paymentNote"
                {...register('paymentNote')}
                placeholder="Thank you!"
                className="mt-1.5"
                aria-describedby="paymentNote-help"
              />
              <p id="paymentNote-help" className="text-sm text-muted-foreground mt-1">
                Optional message for the recipient
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="min-w-[44px] min-h-[44px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[44px] min-h-[44px]"
            >
              {loading ? 'Creating...' : 'Create Payment QR'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Preview Section */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold text-lg mb-2">Preview</h3>
        <p className="text-sm text-muted-foreground">
          Your payment QR will redirect users to {providerConfig.label}
          {provider === 'ZELLE' && ' via an instruction page'}
        </p>
      </Card>
    </div>
  );
}
