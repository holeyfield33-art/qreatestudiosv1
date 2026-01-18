import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function getAdvancedAnalytics(
  qrCodeId: string,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || subDays(new Date(), 30);
  const end = endDate || new Date();

  const where = {
    qrCodeId,
    scannedAt: {
      gte: start,
      lte: end,
    },
  };

  const scans = await prisma.analytics.findMany({
    where,
    orderBy: { scannedAt: 'asc' },
  });

  const uniqueIPs = new Set(scans.map((s) => s.ipAddress)).size;

  const scansByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: scans.filter((s) => new Date(s.scannedAt).getHours() === hour).length,
  }));

  const scansByDayOfWeek = Array.from({ length: 7 }, (_, day) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
    count: scans.filter((s) => new Date(s.scannedAt).getDay() === day).length,
  }));

  const scansByDate = scans.reduce((acc: Record<string, number>, scan) => {
    const date = format(new Date(scan.scannedAt), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const timeSeriesData = Object.entries(scansByDate).map(([date, count]) => ({
    date,
    count,
  }));

  const deviceStats = scans.reduce((acc: Record<string, number>, scan) => {
    acc[scan.deviceType || 'unknown'] = (acc[scan.deviceType || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  const browserStats = scans.reduce((acc: Record<string, number>, scan) => {
    acc[scan.browser || 'unknown'] = (acc[scan.browser || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  interface GeoDataItem {
    city: string | null;
    country: string | null;
    count: number;
  }

  const geoData = scans
    .filter((s) => s.city && s.country)
    .reduce((acc: Record<string, GeoDataItem>, scan) => {
      const key = `${scan.city}, ${scan.country}`;
      if (!acc[key]) {
        acc[key] = { city: scan.city, country: scan.country, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {});

  return {
    totalScans: scans.length,
    uniqueUsers: uniqueIPs,
    scansByHour,
    scansByDayOfWeek,
    timeSeriesData,
    deviceStats,
    browserStats,
    geoData: Object.values(geoData),
    peakHour: scansByHour.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    ),
    peakDay: scansByDayOfWeek.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    ),
  };
}

export async function compareQRCodes(qrCodeIds: string[], dateRange?: { start: Date; end: Date }) {
  const comparisons = await Promise.all(
    qrCodeIds.map(async (id) => {
      const qr = await prisma.qRCode.findUnique({ where: { id } });
      const analytics = await getAdvancedAnalytics(
        id,
        dateRange?.start,
        dateRange?.end
      );
      return {
        qrCode: qr,
        analytics,
      };
    })
  );

  return comparisons;
}
