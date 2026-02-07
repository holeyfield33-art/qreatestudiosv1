import { prisma } from '@/lib/prisma';
import { getFeatureAccess, isWithinLimit, type PlanType } from './feature-access';

/**
 * Server-side plan enforcement — checks user's plan and enforces limits.
 * Always use this in API routes; never trust client-side feature checks alone.
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { parentOrganizationId: true },
  });

  if (!user?.parentOrganizationId) return 'FREE';

  const org = await prisma.organization.findUnique({
    where: { id: user.parentOrganizationId },
    select: { plan: true },
  });

  return (org?.plan as PlanType) || 'FREE';
}

/**
 * Check if user can create more QR codes based on their plan
 */
export async function canCreateQRCode(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(userId);
  const currentCount = await prisma.qRCode.count({ where: { userId } });

  if (!isWithinLimit(plan, 'maxQRCodes', currentCount)) {
    const access = getFeatureAccess(plan);
    return {
      allowed: false,
      reason: `Your ${plan} plan allows up to ${access.maxQRCodes} QR codes. Please upgrade to create more.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can access a specific feature based on their plan
 */
export async function canAccessFeature(
  userId: string,
  feature: keyof ReturnType<typeof getFeatureAccess>
): Promise<{ allowed: boolean; plan: PlanType; reason?: string }> {
  const plan = await getUserPlan(userId);
  const access = getFeatureAccess(plan);
  const value = access[feature];

  if (typeof value === 'boolean' && !value) {
    return {
      allowed: false,
      plan,
      reason: `The ${feature} feature is not available on your ${plan} plan. Please upgrade.`,
    };
  }

  return { allowed: true, plan };
}

/**
 * Verify that a user can access a landing page (owns it or is in the same org)
 */
export async function canAccessLandingPage(
  userId: string,
  pageId: string
): Promise<boolean> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
    select: { userId: true },
  });

  if (!page) return false;
  if (page.userId === userId) return true;

  // Check if both users are in the same organization
  const pageOwner = await prisma.user.findUnique({
    where: { id: page.userId },
    select: { parentOrganizationId: true },
  });

  if (pageOwner?.parentOrganizationId) {
    const membership = await prisma.organizationMember.findFirst({
      where: { organizationId: pageOwner.parentOrganizationId, userId },
    });
    return !!membership;
  }

  return false;
}
