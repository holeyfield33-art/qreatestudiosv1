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
      const pdf = exportAnalyticsToPDF(analytics, qrCode.name);
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-${qrCode.name.replace(/[^a-z0-9]/gi, '-')}.pdf"`,
        },
      });
    } else if (format === 'csv') {
      // Generate CSV with raw scan data
      const where: any = { qrCodeId };
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
      const csv = exportTimeSeriesCSV(analytics.timeSeriesData);

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
