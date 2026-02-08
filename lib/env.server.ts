/**
 * Server-side environment validation.
 *
 * Required vars crash at import time (fail-fast).
 * Optional vars are typed but allowed to be undefined — callers must check
 * via the `capabilities` export before using the associated service.
 */
import { z } from 'zod';

// ─── Schema ────────────────────────────────────────────────────────
const serverEnvSchema = z.object({
  // Required to boot
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional()
    .default(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),

  // Optional — feature-gated
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_PRICE_ID: z.string().optional(),
  STRIPE_AGENCY_PRICE_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  FROM_EMAIL: z.string().email().optional().default('noreply@qreatestudios.com'),
  ADMIN_EMAIL: z.string().email().optional(),
  SUPPORT_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
});

// ─── Parse (fail-fast) ─────────────────────────────────────────────
function parseServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ✗ ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\n❌ Invalid server environment variables:\n${formatted}\n\nCheck .env or deployment env.\n`,
    );
  }
  return result.data;
}

export const serverEnv = parseServerEnv();

// ─── Capabilities ──────────────────────────────────────────────────
export type Capabilities = {
  ai: boolean;
  billing: boolean;
  email: boolean;
  imageSearch: boolean;
  maps: boolean;
  rateLimiting: boolean;
  githubAuth: boolean;
};

export function getCapabilities(): Capabilities {
  return {
    ai: !!serverEnv.OPENAI_API_KEY,
    billing: !!serverEnv.STRIPE_SECRET_KEY,
    email: !!serverEnv.RESEND_API_KEY,
    imageSearch: !!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    maps: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    rateLimiting: !!serverEnv.UPSTASH_REDIS_REST_URL && !!serverEnv.UPSTASH_REDIS_REST_TOKEN,
    githubAuth: !!serverEnv.GITHUB_ID && !!serverEnv.GITHUB_SECRET,
  };
}

/**
 * Guard helper — throws a typed 503 error when a capability is missing.
 * Use in API routes: `requireCapability('ai')` throws → catch returns 503.
 */
export class ProviderNotConfiguredError extends Error {
  public readonly statusCode = 503;
  constructor(provider: string) {
    super(`PROVIDER_NOT_CONFIGURED: ${provider}`);
    this.name = 'ProviderNotConfiguredError';
  }
}

export function requireCapability(cap: keyof Capabilities): void {
  const caps = getCapabilities();
  if (!caps[cap]) {
    throw new ProviderNotConfiguredError(cap);
  }
}
