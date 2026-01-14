import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch analytics
    const analytics = await prisma.analytics.findMany({
      where: { qrCodeId: id },
      orderBy: { scannedAt: 'desc' },
      take: 1000, // Limit to last 1000 scans
    });

    // Group by table number
    const byTable: Record<string, number> = {};
    const byLocation: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    const byDevice: Record<string, number> = {};

    analytics.forEach((scan) => {
      // By table
      if (scan.tableNumber) {
        byTable[scan.tableNumber] = (byTable[scan.tableNumber] || 0) + 1;
      }

      // By location
      if (scan.location) {
        byLocation[scan.location] = (byLocation[scan.location] || 0) + 1;
      }

      // By date
      const date = new Date(scan.scannedAt).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;

      // By device
      if (scan.deviceType) {
        byDevice[scan.deviceType] = (byDevice[scan.deviceType] || 0) + 1;
      }
    });

    // Get top tables
    const topTables = Object.entries(byTable)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([table, count]) => ({ table, count }));

    // Get recent scans
    const recentScans = analytics.slice(0, 50).map((scan) => ({
      id: scan.id,
      scannedAt: scan.scannedAt,
      tableNumber: scan.tableNumber,
      location: scan.location,
      deviceType: scan.deviceType,
      browser: scan.browser,
      country: scan.country,
      city: scan.city,
    }));

    return NextResponse.json({
      total: analytics.length,
      byTable,
      byLocation,
      byDate,
      byDevice,
      topTables,
      recentScans,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
