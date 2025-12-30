import { PaymentProvider } from '@prisma/client';
import { getBaseUrl } from '@/lib/utils/urls';

export interface PaymentHandle {
  provider: PaymentProvider;
  handle: string;
}

/**
 * Generates a payment URL for a given provider and handle
 */
export function generatePaymentUrl(
  provider: PaymentProvider,
  handle: string,
  shortCode: string,
  amount?: number,
  currency: string = 'USD',
  note?: string
): string {
  const baseUrl = getBaseUrl();

  switch (provider) {
    case 'CASHAPP':
      return amount
        ? `https://cash.app/${handle}/${amount}`
        : `https://cash.app/${handle}`;

    case 'VENMO':
      const venmoParams = new URLSearchParams();
      if (amount) venmoParams.set('amount', amount.toString());
      if (note) venmoParams.set('note', note);
      venmoParams.set('txn', 'pay');
      return `https://venmo.com/${handle}?${venmoParams}`;

    case 'ZELLE':
      // Zelle has no direct link - redirect to instruction page
      return `${baseUrl}/pay/zelle/${shortCode}`;

    case 'PAYPAL':
      return amount
        ? `https://paypal.me/${handle}/${amount}${currency}`
        : `https://paypal.me/${handle}`;

    case 'STRIPE':
      // User provides full Stripe Payment Link
      return handle;

    case 'SQUARE':
      // User provides full Square payment link
      return handle;

    case 'APPLE_PAY':
    case 'GOOGLE_PAY':
      // Return instruction page for app-based payments
      return `${baseUrl}/pay/${provider.toLowerCase()}/${shortCode}`;

    default:
      return handle;
  }
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a payment handle for a given provider
 */
export function validatePaymentHandle(
  provider: PaymentProvider,
  handle: string
): ValidationResult {
  switch (provider) {
    case 'CASHAPP':
      if (!handle.startsWith('$')) {
        return { valid: false, error: 'Cash App handle must start with $' };
      }
      if (handle.length < 2 || handle.length > 21) {
        return { valid: false, error: 'Cash App handle must be 1-20 characters after $' };
      }
      if (!/^[$][a-zA-Z0-9_]+$/.test(handle)) {
        return { valid: false, error: 'Cash App handle can only contain letters, numbers, and underscores' };
      }
      return { valid: true };

    case 'VENMO':
      if (handle.length < 5 || handle.length > 30) {
        return { valid: false, error: 'Venmo username must be 5-30 characters' };
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
        return { valid: false, error: 'Venmo username can only contain letters, numbers, hyphens, and underscores' };
      }
      return { valid: true };

    case 'ZELLE':
      // Email or phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+1[0-9]{10}$/;
      if (!emailRegex.test(handle) && !phoneRegex.test(handle)) {
        return { valid: false, error: 'Zelle handle must be a valid email or phone number (+1XXXXXXXXXX)' };
      }
      return { valid: true };

    case 'PAYPAL':
      if (handle.length < 3 || handle.length > 30) {
        return { valid: false, error: 'PayPal.me username must be 3-30 characters' };
      }
      return { valid: true };

    case 'STRIPE':
      if (!handle.startsWith('https://buy.stripe.com/')) {
        return { valid: false, error: 'Must be a valid Stripe Payment Link (starts with https://buy.stripe.com/)' };
      }
      return { valid: true };

    case 'SQUARE':
      if (!handle.startsWith('https://square.link/')) {
        return { valid: false, error: 'Must be a valid Square payment link (starts with https://square.link/)' };
      }
      return { valid: true };

    case 'APPLE_PAY':
    case 'GOOGLE_PAY':
      return { valid: true }; // Any non-empty string for instruction pages

    default:
      return { valid: true };
  }
}
