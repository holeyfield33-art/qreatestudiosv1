import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

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
        include: { Subscription: true },
      }),
      prisma.securityReport.findMany({
        where: { status: 'pending' as const },
        take: 5,
        include: { QRCode: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const subscriptionsByPlan = subscriptions.reduce((acc: Record<string, number>, sub: { plan: string }) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const planPrices: Record<string, number> = {
      PRO: 29,
      BUSINESS: 79,
      AGENCY: 249,
    };

    const totalRevenue = subscriptions.reduce((sum: number, sub: { plan: string }) => {
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
    if (process.env.NODE_ENV === 'development') {
        console.error('Admin stats error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
