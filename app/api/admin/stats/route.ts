import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersThisWeek,
      totalQRCodes,
      activeQRCodes,
      totalScans,
      scansThisMonth,
      subscriptions,
      recentUsers,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.qRCode.count(),
      prisma.qRCode.count({ where: { isActive: true } }),
      prisma.analytics.count(),
      prisma.analytics.count({ where: { scannedAt: { gte: monthStart } } }),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' as const },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { subscription: true },
      }),
      prisma.securityReport.findMany({
        where: { status: 'pending' as const },
        take: 5,
        include: { qrCode: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const subscriptionsByPlan = subscriptions.reduce((acc: any, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1;
      return acc;
    }, {});

    const planPrices: Record<string, number> = {
      PRO: 29,
      BUSINESS: 79,
      AGENCY: 249,
    };

    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return sum + (planPrices[sub.plan] || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      totalUsers,
      newUsersThisWeek,
      totalQRCodes,
      activeQRCodes,
      totalScans,
      scansThisMonth,
      activeSubscriptions: subscriptions.length,
      subscriptionsByPlan,
      totalRevenue: totalRevenue * 100, // cents
      recentUsers,
      pendingReports,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
