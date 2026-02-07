export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWhiteLabelStats } from '@/lib/services/white-label-service';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrg = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { Organization: true },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!userOrg.Organization.isWhiteLabel) {
      return NextResponse.json(
        { error: 'White-label feature not enabled' },
        { status: 403 }
      );
    }

    const stats = await getWhiteLabelStats(userOrg.organizationId);
    const revenueShare = userOrg.Organization.revenueShare || 70;

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        revenueShare,
        yourShare: stats.revenue * (revenueShare / 100),
        platformFee: stats.revenue * ((100 - revenueShare) / 100),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching white-label stats:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
