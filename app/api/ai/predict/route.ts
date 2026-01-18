import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { predictScanRate } from '@/lib/services/ai-optimization-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qrCodeId, qrCodeData } = await req.json();

    if (!qrCodeId && !qrCodeData) {
      return NextResponse.json({ error: 'QR code ID or data required' }, { status: 400 });
    }

    // Fetch historical data if QR code ID provided
    let historicalData;
    if (qrCodeId) {
      const analytics = await prisma.analytics.groupBy({
        by: ['scannedAt'],
        where: {
          qrCodeId,
          scannedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          scannedAt: 'asc',
        },
      });

      historicalData = analytics.map((day: { scannedAt: Date; _count: { id: number } }) => ({
        date: day.scannedAt.toISOString(),
        scans: day._count.id,
      }));
    }

    const prediction = await predictScanRate(qrCodeData || {}, historicalData);

    return NextResponse.json({
      success: true,
      ...prediction,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Prediction error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to predict scan rate' },
      { status: 500 }
    );
  }
}
