import { prisma } from '@/lib/prisma';

export interface TenantContext {
  userId: string;
  organizationId?: string;
  plan: string;
  isWhiteLabel: boolean;
}

export async function getTenantContext(userId: string): Promise<TenantContext> {
  const member = await prisma.organizationMember.findFirst({
    where: { userId },
    include: {
      Organization: {
        select: { id: true, plan: true, isWhiteLabel: true }
      }
    }
  });

  return {
    userId,
    organizationId: member?.Organization?.id,
    plan: member?.Organization?.plan || 'FREE',
    isWhiteLabel: member?.Organization?.isWhiteLabel || false,
  };
}

export function scopeQueryByUser(userId: string) {
  return { userId };
}

export function scopeQueryByOrganization(organizationId: string) {
  return { organizationId };
}

export async function validateTenantAccess(
  userId: string,
  resourceUserId: string,
  organizationId?: string
): Promise<boolean> {
  // Direct ownership check
  if (userId === resourceUserId) return true;

  // Organization membership check
  if (organizationId) {
    const member = await prisma.organizationMember.findFirst({
      where: { userId, organizationId }
    });
    return !!member;
  }

  return false;
}
