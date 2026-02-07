import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimitName = 'authSignIn' | 'verifyPassword' | 'ai';

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedisEnv ? Redis.fromEnv() : null;

const rateLimiters: Record<RateLimitName, Ratelimit | null> = {
  authSignIn: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:auth-signin',
      })
    : null,
  verifyPassword: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'ratelimit:qr-verify',
      })
    : null,
  ai: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: 'ratelimit:ai',
      })
    : null,
};

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip');
  return ip || realIp || 'unknown';
}

export async function applyRateLimit(
  request: NextRequest,
  name: RateLimitName
): Promise<NextResponse | null> {
  const limiter = rateLimiters[name];
  if (!limiter) return null;

  const identifier = `${name}:${getClientIp(request)}`;
  const result = await limiter.limit(identifier);

  if (result.success) return null;

  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(result.reset / 1000).toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
      },
    }
  );
}
