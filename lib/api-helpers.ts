import { NextResponse } from 'next/server';
import { ProviderNotConfiguredError } from '@/lib/env.server';

/**
 * Structured API error response — used by all API route catch blocks.
 *
 * Returns:
 *   503 for ProviderNotConfiguredError (missing env var)
 *   429 for rate-limit errors
 *   500 for everything else
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Provider not configured — 503 with structured hint
  if (error instanceof ProviderNotConfiguredError) {
    const provider = error.message.replace('PROVIDER_NOT_CONFIGURED: ', '');
    const envHints: Record<string, string> = {
      ai: 'Set OPENAI_API_KEY to enable AI features',
      billing: 'Set STRIPE_SECRET_KEY to enable billing',
      email: 'Set RESEND_API_KEY to enable email',
      imageSearch: 'Set NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to enable image search',
      maps: 'Set NEXT_PUBLIC_MAPBOX_TOKEN to enable maps',
      rateLimiting: 'Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for rate limiting',
      githubAuth: 'Set GITHUB_ID + GITHUB_SECRET for GitHub login',
    };

    return NextResponse.json(
      {
        error: {
          code: 'PROVIDER_NOT_CONFIGURED',
          message: `The ${provider} provider is not configured.`,
          hint: envHints[provider] || `Configure the ${provider} provider via environment variables.`,
        },
      },
      { status: 503 },
    );
  }

  // Rate limit
  if (error instanceof Error && error.message.includes('rate limit')) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again in a moment.',
        },
      },
      { status: 429 },
    );
  }

  // Generic server error
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error${context ? ` ${context}` : ''}]`, error);
  }

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred.',
      },
    },
    { status: 500 },
  );
}
