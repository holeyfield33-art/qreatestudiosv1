import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from './stripe-service';

export async function canCreateQR(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || 'FREE';
  const limit = PLAN_LIMITS[plan].qrCodes;

  if (limit === -1) {
    return { allowed: true }; // Unlimited
  }

  const count = await prisma.qRCode.count({
    where: { userId },
  });

  if (count >= limit) {
    return {
      allowed: false,
      reason: `QR code limit reached. Upgrade to create more.`,
      limit,
      current: count,
    };
  }

  return { allowed: true, limit, current: count };
}

export async function canUseAI(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || 'FREE';
  
  // Check if plan includes AI (Free plan has limited AI, Pro+ has more)
  // Token limits are checked in ai-usage-service
  return { allowed: true };
}

export async function canCreatePrintOrder(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || 'FREE';
  
  if (plan === 'FREE') {
    return {
      allowed: false,
      reason: 'Print orders require a Pro plan or higher.',
    };
  }

  return { allowed: true };
}

export async function canAccessCRM(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || 'FREE';
  
  if (plan === 'FREE' || plan === 'PRO') {
    return {
      allowed: false,
      reason: 'CRM features require a Business plan or higher.',
    };
  }

  return { allowed: true };
}

export async function getUserPlan(userId: string): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription?.plan || 'FREE';
}

export async function getUserLimits(userId: string): Promise<{
  plan: string;
  qrCodes: { limit: number; current: number };
  aiTokens: { limit: number; used: number };
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || 'FREE';
  const limits = PLAN_LIMITS[plan];

  const qrCount = await prisma.qRCode.count({
    where: { userId },
  });

  // Get AI usage from current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const aiUsageRecords = await prisma.aIUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: monthStart,
      },
    },
  });

  const totalTokensUsed = aiUsageRecords.reduce(
    (sum, record) => sum + record.totalTokens,
    0
  );

  return {
    plan,
    qrCodes: {
      limit: limits.qrCodes,
      current: qrCount,
    },
    aiTokens: {
      limit: limits.aiTokens,
      used: totalTokensUsed,
    },
  };
}
