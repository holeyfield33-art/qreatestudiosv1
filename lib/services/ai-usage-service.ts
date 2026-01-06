import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * Track AI usage for billing and analytics
 */
export async function trackAIUsage(
  userId: string,
  feature: string,
  tokensUsed: { prompt: number; completion: number; total: number },
  cost: number,
  prompt: string = '',
  response: string = ''
): Promise<void> {
  try {
    await prisma.aIUsage.create({
      data: {
        id: randomUUID(),
        userId,
        feature,
        prompt: prompt || 'N/A',
        response: response || 'N/A',
        tokensUsed: tokensUsed.total,
        model: 'gpt-4o',
        promptTokens: tokensUsed.prompt,
        completionTokens: tokensUsed.completion,
        totalTokens: tokensUsed.total,
        cost,
      },
    });
  } catch (error) {
    console.error('Failed to track AI usage:', error);
    // Don't throw - tracking failures shouldn't break generation
  }
}

/**
 * Get user's token usage statistics
 */
export async function getUserTokenUsage(userId: string, startDate?: Date): Promise<{
  totalTokens: number;
  totalCost: number;
  byFeature: Array<{ feature: string; tokens: number; cost: number }>;
}> {
  const where: any = { userId };
  if (startDate) {
    where.createdAt = { gte: startDate };
  }

  const [usage, byFeature] = await Promise.all([
    prisma.aIUsage.aggregate({
      where,
      _sum: {
        totalTokens: true,
        cost: true,
      },
    }),
    prisma.aIUsage.groupBy({
      by: ['feature'],
      where,
      _sum: {
        totalTokens: true,
        cost: true,
      },
    }),
  ]);

  return {
    totalTokens: usage._sum.totalTokens || 0,
    totalCost: usage._sum.cost || 0,
    byFeature: byFeature.map((item) => ({
      feature: item.feature,
      tokens: item._sum.totalTokens || 0,
      cost: item._sum.cost || 0,
    })),
  };
}

/**
 * Check if user is within their plan's token limit
 */
export async function checkTokenLimit(userId: string, plan: string): Promise<{
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
}> {
  // Token limits by plan (monthly)
  const limits: Record<string, number> = {
    FREE: 10_000,
    PRO: 100_000,
    BUSINESS: 500_000,
    AGENCY: 1_000_000,
  };

  const limit = limits[plan] || limits.FREE;

  // Get usage for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await getUserTokenUsage(userId, startOfMonth);

  return {
    allowed: usage.totalTokens < limit,
    limit,
    used: usage.totalTokens,
    remaining: Math.max(0, limit - usage.totalTokens),
  };
}
