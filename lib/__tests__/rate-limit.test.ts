import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within limit', async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });
    const result = await limiter.check(5, 'test-token');
    expect(result.remaining).toBe(4);
  });

  it('tracks request count per token', async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });
    await limiter.check(5, 'test-token');
    await limiter.check(5, 'test-token');
    const result = await limiter.check(5, 'test-token');
    expect(result.remaining).toBe(2);
  });

  it('throws when limit exceeded', async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });
    await limiter.check(2, 'test-token');
    await limiter.check(2, 'test-token');
    await expect(limiter.check(2, 'test-token')).rejects.toThrow('Rate limit exceeded');
  });

  it('isolates tokens', async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });
    await limiter.check(2, 'token-a');
    await limiter.check(2, 'token-a');
    // Token B should still have full quota
    const result = await limiter.check(2, 'token-b');
    expect(result.remaining).toBe(1);
  });
});
