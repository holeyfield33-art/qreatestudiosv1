import { UAParser } from 'ua-parser-js';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export interface ScanData {
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
  city?: string;
}

export async function trackScan(
  qrCodeId: string,
  scanData: ScanData
): Promise<void> {
  try {
    // Parse user agent
    const parser = new UAParser();
    parser.setUA(scanData.userAgent || '');
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    await prisma.analytics.create({
      data: {
        id: randomUUID(),
        qrCodeId,
        deviceType: device.type || 'desktop',
        browser: browser.name || 'unknown',
        os: os.name || 'unknown',
        country: scanData.country || null,
        city: scanData.city || null,
        ipAddress: scanData.ipAddress || null,
        userAgent: scanData.userAgent || null,
        referrer: scanData.referrer || null,
      },
    });

    // Increment scan count atomically
    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: { scanCount: { increment: 1 } },
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't throw - tracking failures shouldn't break scans
  }
}

export async function getQRAnalytics(
  qrCodeId: string,
  startDate?: Date,
  endDate?: Date
) {
  const where: any = { qrCodeId };
  if (startDate || endDate) {
    where.scannedAt = {};
    if (startDate) where.scannedAt.gte = startDate;
    if (endDate) where.scannedAt.lte = endDate;
  }

  const [scans, deviceStats, browserStats, uniqueIPs] = await Promise.all([
    prisma.analytics.count({ where }),
    prisma.analytics.groupBy({
      by: ['deviceType'],
      where,
      _count: true,
    }),
    prisma.analytics.groupBy({
      by: ['browser'],
      where,
      _count: true,
    }),
    prisma.analytics.findMany({
      where,
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    }),
  ]);

  // Get scans by day for chart
  const scansByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT 
      DATE("scannedAt") as date,
      COUNT(*) as count
    FROM "Analytics"
    WHERE "qrCodeId" = ${qrCodeId}
    ${startDate ? prisma.$queryRaw`AND "scannedAt" >= ${startDate}` : prisma.$queryRaw``}
    ${endDate ? prisma.$queryRaw`AND "scannedAt" <= ${endDate}` : prisma.$queryRaw``}
    GROUP BY DATE("scannedAt")
    ORDER BY DATE("scannedAt") ASC
  `;

  return {
    totalScans: scans,
    uniqueScans: uniqueIPs.length,
    deviceBreakdown: deviceStats.map((d: any) => ({
      type: d.deviceType,
      count: d._count,
    })),
    browserBreakdown: browserStats.map((b: any) => ({
      browser: b.browser,
      count: b._count,
    })),
    scansByDay: scansByDay.map((s: any) => ({
      date: s.date,
      count: Number(s.count),
    })),
  };
}

export async function getUserAnalytics(userId: string) {
  const [totalScans, qrCodes, recentScans] = await Promise.all([
    prisma.analytics.count({
      where: { QRCode: { userId } },
    }),
    prisma.qRCode.count({
      where: { userId, isActive: true },
    }),
    prisma.analytics.findMany({
      where: { QRCode: { userId } },
      take: 10,
      orderBy: { scannedAt: 'desc' },
      include: {
        QRCode: { select: { name: true } },
      },
    }),
  ]);

  return {
    totalScans,
    activeQRCodes: qrCodes,
    recentScans,
  };
}
