export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAdvancedAnalytics } from '@/lib/services/analytics-enhancement';
import { exportAnalyticsToPDF, exportAnalyticsToCSV, exportTimeSeriesCSV } from '@/lib/services/export-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    const { qrCodeId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({ 
      where: { id: qrCodeId },
      select: { id: true, userId: true, name: true }
    });

    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'pdf';
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    if (format === 'pdf') {
      // Generate PDF
      const analytics = await getAdvancedAnalytics(qrCodeId, startDate, endDate);
      const analyticsData = {
        ...analytics,
        geoData: (analytics.geoData as Array<{ city: string; country: string; count: number }>),
      };
      const pdf = exportAnalyticsToPDF(analyticsData, qrCode.name);
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-${qrCode.name.replace(/[^a-z0-9]/gi, '-')}.pdf"`,
        },
      });
    } else if (format === 'csv') {
      // Generate CSV with raw scan data
      const where: {
        qrCodeId: string;
        scannedAt?: { gte: Date; lte: Date };
      } = { qrCodeId };
      if (startDate && endDate) {
        where.scannedAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const scans = await prisma.analytics.findMany({
        where,
        orderBy: { scannedAt: 'desc' },
      });

      const csv = exportAnalyticsToCSV(scans);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${qrCode.name.replace(/[^a-z0-9]/gi, '-')}.csv"`,
        },
      });
    } else if (format === 'csv-timeseries') {
      // Generate CSV with time series data
      const analytics = await getAdvancedAnalytics(qrCodeId, startDate, endDate);
      const timeSeriesData = analytics.timeSeriesData.map((item: { date: string | Date; count: number | bigint }) => ({
        date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
        count: Number(item.count),
      }));
      const csv = exportTimeSeriesCSV(timeSeriesData);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="timeseries-${qrCode.name.replace(/[^a-z0-9]/gi, '-')}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format. Use: pdf, csv, or csv-timeseries' }, { status: 400 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error exporting analytics:', error);
    }
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
