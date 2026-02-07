import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find user's organization membership
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: {
        Organization: {
          include: {
            OrganizationMember: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    role: true,
                  }
                }
              }
            },
            Client: { select: { id: true } },
            QRCode: { select: { id: true } },
          }
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Only owners and admins can access tenant admin
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const org = membership.Organization;

    // Get aggregate stats
    const memberUserIds = org.OrganizationMember.map(m => m.userId);

    const [totalQRCodes, totalScans, totalLandingPages, activeSubscriptions] = await Promise.all([
      prisma.qRCode.count({ where: { userId: { in: memberUserIds } } }),
      prisma.analytics.count({
        where: { QRCode: { userId: { in: memberUserIds } } }
      }),
      prisma.landingPage.count({ where: { userId: { in: memberUserIds } } }),
      prisma.subscription.count({
        where: { userId: { in: memberUserIds }, status: 'active' }
      }),
    ]);

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        plan: org.plan,
        isWhiteLabel: org.isWhiteLabel,
        customDomain: org.customDomain,
        branding: org.branding,
        revenueShare: org.revenueShare,
        createdAt: org.createdAt,
      },
      members: org.OrganizationMember.map(m => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.User,
      })),
      stats: {
        totalMembers: org.OrganizationMember.length,
        totalClients: org.Client.length,
        totalQRCodes,
        totalScans,
        totalLandingPages,
        activeSubscriptions,
      },
      currentUserRole: membership.role,
    });
  } catch (error) {
    console.error('Tenant admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load tenant data' },
      { status: 500 }
    );
  }
}
