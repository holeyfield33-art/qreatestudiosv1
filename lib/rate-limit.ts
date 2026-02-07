interface RateLimitOptions {
  interval: number; // in ms
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  check: (limit: number, token: string) => Promise<{ remaining: number; limit: number }>;
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const tokenCache = new Map<string, { count: number; expiresAt: number }>();

  // Cleanup old entries every interval
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokenCache.entries()) {
      if (value.expiresAt < now) {
        tokenCache.delete(key);
      }
    }
  }, options.interval);

  return {
    check: async (limit: number, token: string) => {
      const now = Date.now();
      const entry = tokenCache.get(token);

      if (!entry || entry.expiresAt < now) {
        tokenCache.set(token, { count: 1, expiresAt: now + options.interval });
        return { remaining: limit - 1, limit };
      }

      entry.count++;

      if (entry.count > limit) {
        const error = new Error('Rate limit exceeded');
        (error as any).status = 429;
        throw error;
      }

      return { remaining: limit - entry.count, limit };
    }
  };
}
