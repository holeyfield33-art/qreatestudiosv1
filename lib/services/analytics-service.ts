import { UAParser } from 'ua-parser-js';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Make geoip optional in case data files are missing
interface GeoIPLookupResult {
  country: string;
  city?: string;
}

interface GeoIPModule {
  lookup(ip: string): GeoIPLookupResult | null;
}

let geoip: GeoIPModule | null = null;
try {
  geoip = require('geoip-lite') as GeoIPModule;
} catch (error) {
  console.warn('geoip-lite not available, geolocation features will be limited');
}

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

    // Get geolocation from IP if not provided
    let country = scanData.country;
    let city = scanData.city;
    
    if (!country && scanData.ipAddress && geoip) {
      const geo = geoip.lookup(scanData.ipAddress);
      if (geo) {
        country = geo.country;
        city = geo.city || undefined;
      }
    }

    await prisma.analytics.create({
      data: {
        id: randomUUID(),
        qrCodeId,
        deviceType: device.type || 'desktop',
        browser: browser.name || 'unknown',
        os: os.name || 'unknown',
        country: country || null,
        city: city || null,
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
  const where: {
    qrCodeId: string;
    scannedAt?: {
      gte?: Date;
      lte?: Date;
    };
    country?: {
      not: null;
    };
  } = { qrCodeId };
  if (startDate || endDate) {
    where.scannedAt = {};
    if (startDate) where.scannedAt.gte = startDate;
    if (endDate) where.scannedAt.lte = endDate;
  }

  const [scans, deviceStats, browserStats, uniqueIPs, locationData] = await Promise.all([
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
    // Get location data
    prisma.analytics.groupBy({
      by: ['country', 'city'],
      where: {
        ...where,
        country: { not: null },
      },
      _count: true,
    }),
  ]);

  // Get scans by day for chart
  let scansByDay: Array<{ date: Date; count: bigint }>;

  if (startDate && endDate) {
    scansByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE("scannedAt") as date,
        COUNT(*) as count
      FROM "Analytics"
      WHERE "qrCodeId" = ${qrCodeId}
        AND "scannedAt" >= ${startDate}
        AND "scannedAt" <= ${endDate}
      GROUP BY DATE("scannedAt")
      ORDER BY DATE("scannedAt") ASC
    `;
  } else if (startDate) {
    scansByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE("scannedAt") as date,
        COUNT(*) as count
      FROM "Analytics"
      WHERE "qrCodeId" = ${qrCodeId}
        AND "scannedAt" >= ${startDate}
      GROUP BY DATE("scannedAt")
      ORDER BY DATE("scannedAt") ASC
    `;
  } else if (endDate) {
    scansByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE("scannedAt") as date,
        COUNT(*) as count
      FROM "Analytics"
      WHERE "qrCodeId" = ${qrCodeId}
        AND "scannedAt" <= ${endDate}
      GROUP BY DATE("scannedAt")
      ORDER BY DATE("scannedAt") ASC
    `;
  } else {
    scansByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE("scannedAt") as date,
        COUNT(*) as count
      FROM "Analytics"
      WHERE "qrCodeId" = ${qrCodeId}
      GROUP BY DATE("scannedAt")
      ORDER BY DATE("scannedAt") ASC
    `;
  }

  // Process location data to include coordinates
  const locations = locationData
    .filter((loc) => loc.country)
    .map((loc) => {
      // Get country code and coordinates
      const countryCode = getCountryCode(loc.country || '');
      const coords = getCountryCoordinates(countryCode);
      
      // If city exists, try to get city coordinates
      let lat = coords.lat;
      let lng = coords.lng;
      
      if (loc.city) {
        const cityCoords = getCityCoordinates(loc.city, countryCode);
        if (cityCoords) {
          lat = cityCoords.lat;
          lng = cityCoords.lng;
        }
      }
      
      return {
        country: loc.country,
        countryCode,
        city: loc.city || undefined,
        scans: loc._count,
        lat,
        lng,
      };
    });

  return {
    totalScans: scans,
    uniqueScans: uniqueIPs.length,
    deviceBreakdown: deviceStats.map((d) => ({
      type: d.deviceType,
      count: d._count,
    })),
    browserBreakdown: browserStats.map((b) => ({
      browser: b.browser,
      count: b._count,
    })),
    scansByDay: scansByDay.map((s) => ({
      date: s.date,
      count: Number(s.count),
    })),
    locations,
  };
}

// Helper function to get country code from country name
function getCountryCode(countryName: string): string {
  // Common country name to ISO code mapping
  const countryMap: Record<string, string> = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Spain': 'ES',
    'Italy': 'IT',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Japan': 'JP',
    'China': 'CN',
    'India': 'IN',
    'Russia': 'RU',
    'South Korea': 'KR',
    'Netherlands': 'NL',
    'Switzerland': 'CH',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Czech Republic': 'CZ',
    'Romania': 'RO',
    'Hungary': 'HU',
    'Ireland': 'IE',
    'New Zealand': 'NZ',
    'Singapore': 'SG',
    'Hong Kong': 'HK',
    'Taiwan': 'TW',
    'Thailand': 'TH',
    'Malaysia': 'MY',
    'Philippines': 'PH',
    'Indonesia': 'ID',
    'Vietnam': 'VN',
    'Turkey': 'TR',
    'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE',
    'South Africa': 'ZA',
    'Egypt': 'EG',
    'Nigeria': 'NG',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Venezuela': 'VE',
  };
  
  // Try direct match first
  if (countryMap[countryName]) {
    return countryMap[countryName];
  }
  
  // If it's already a 2-letter code, return it
  if (countryName.length === 2) {
    return countryName.toUpperCase();
  }
  
  // Default fallback
  return 'US';
}

// Helper function to get country coordinates
function getCountryCoordinates(countryCode: string): { lat: number; lng: number } {
  const coords: Record<string, { lat: number; lng: number }> = {
    'US': { lat: 37.0902, lng: -95.7129 },
    'GB': { lat: 55.3781, lng: -3.4360 },
    'CA': { lat: 56.1304, lng: -106.3468 },
    'AU': { lat: -25.2744, lng: 133.7751 },
    'DE': { lat: 51.1657, lng: 10.4515 },
    'FR': { lat: 46.2276, lng: 2.2137 },
    'ES': { lat: 40.4637, lng: -3.7492 },
    'IT': { lat: 41.8719, lng: 12.5674 },
    'BR': { lat: -14.2350, lng: -51.9253 },
    'MX': { lat: 23.6345, lng: -102.5528 },
    'JP': { lat: 36.2048, lng: 138.2529 },
    'CN': { lat: 35.8617, lng: 104.1954 },
    'IN': { lat: 20.5937, lng: 78.9629 },
    'RU': { lat: 61.5240, lng: 105.3188 },
    'KR': { lat: 35.9078, lng: 127.7669 },
    'NL': { lat: 52.1326, lng: 5.2913 },
    'CH': { lat: 46.8182, lng: 8.2275 },
    'SE': { lat: 60.1282, lng: 18.6435 },
    'NO': { lat: 60.4720, lng: 8.4689 },
    'DK': { lat: 56.2639, lng: 9.5018 },
    'FI': { lat: 61.9241, lng: 25.7482 },
    'PL': { lat: 51.9194, lng: 19.1451 },
    'BE': { lat: 50.5039, lng: 4.4699 },
    'AT': { lat: 47.5162, lng: 14.5501 },
    'PT': { lat: 39.3999, lng: -8.2245 },
    'GR': { lat: 39.0742, lng: 21.8243 },
    'CZ': { lat: 49.8175, lng: 15.4730 },
    'RO': { lat: 45.9432, lng: 24.9668 },
    'HU': { lat: 47.1625, lng: 19.5033 },
    'IE': { lat: 53.4129, lng: -8.2439 },
    'NZ': { lat: -40.9006, lng: 174.8860 },
    'SG': { lat: 1.3521, lng: 103.8198 },
    'HK': { lat: 22.3193, lng: 114.1694 },
    'TW': { lat: 23.6978, lng: 120.9605 },
    'TH': { lat: 15.8700, lng: 100.9925 },
    'MY': { lat: 4.2105, lng: 101.9758 },
    'PH': { lat: 12.8797, lng: 121.7740 },
    'ID': { lat: -0.7893, lng: 113.9213 },
    'VN': { lat: 14.0583, lng: 108.2772 },
    'TR': { lat: 38.9637, lng: 35.2433 },
    'SA': { lat: 23.8859, lng: 45.0792 },
    'AE': { lat: 23.4241, lng: 53.8478 },
    'ZA': { lat: -30.5595, lng: 22.9375 },
    'EG': { lat: 26.8206, lng: 30.8025 },
    'NG': { lat: 9.0820, lng: 8.6753 },
    'AR': { lat: -38.4161, lng: -63.6167 },
    'CL': { lat: -35.6751, lng: -71.5430 },
    'CO': { lat: 4.5709, lng: -74.2973 },
    'PE': { lat: -9.1900, lng: -75.0152 },
    'VE': { lat: 6.4238, lng: -66.5897 },
  };
  
  return coords[countryCode] || { lat: 0, lng: 0 };
}

// Helper function to get city coordinates (simplified - in production, use a proper geocoding service)
function getCityCoordinates(city: string, countryCode: string): { lat: number; lng: number } | null {
  // Major cities coordinates
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Philadelphia': { lat: 39.9526, lng: -75.1652 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
    'Dallas': { lat: 32.7767, lng: -96.7970 },
    'San Jose': { lat: 37.3382, lng: -121.8863 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Manchester': { lat: 53.4808, lng: -2.2426 },
    'Birmingham': { lat: 52.4862, lng: -1.8904 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Munich': { lat: 48.1351, lng: 11.5820 },
    'Madrid': { lat: 40.4168, lng: -3.7038 },
    'Rome': { lat: 41.9028, lng: 12.4964 },
    'Milan': { lat: 45.4642, lng: 9.1900 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Melbourne': { lat: -37.8136, lng: 144.9631 },
    'Toronto': { lat: 43.6532, lng: -79.3832 },
    'Vancouver': { lat: 49.2827, lng: -123.1207 },
    'Montreal': { lat: 45.5017, lng: -73.5673 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Shanghai': { lat: 31.2304, lng: 121.4737 },
    'Beijing': { lat: 39.9042, lng: 116.4074 },
    'Seoul': { lat: 37.5665, lng: 126.9780 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Brussels': { lat: 50.8503, lng: 4.3517 },
    'Vienna': { lat: 48.2082, lng: 16.3738 },
    'Stockholm': { lat: 59.3293, lng: 18.0686 },
    'Oslo': { lat: 59.9139, lng: 10.7522 },
    'Copenhagen': { lat: 55.6761, lng: 12.5683 },
    'Zurich': { lat: 47.3769, lng: 8.5417 },
    'Geneva': { lat: 46.2044, lng: 6.1432 },
    'Mexico City': { lat: 19.4326, lng: -99.1332 },
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
  };
  
  return cityCoords[city] || null;
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
