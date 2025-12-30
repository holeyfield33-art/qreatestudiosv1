import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { compareQRCodes } from '@/lib/services/analytics-enhancement';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qrCodeIds, startDate, endDate } = await req.json();

    if (!qrCodeIds || !Array.isArray(qrCodeIds) || qrCodeIds.length === 0) {
      return NextResponse.json(
        { error: 'QR code IDs are required' },
        { status: 400 }
      );
    }

    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;

    const comparisons = await compareQRCodes(qrCodeIds, dateRange);

    // Filter out QR codes that don't belong to the user
    const filteredComparisons = comparisons.filter(
      (comparison) => comparison.qrCode?.userId === session.user.id
    );

    return NextResponse.json({
      success: true,
      comparisons: filteredComparisons,
    });
  } catch (error) {
    console.error('Error comparing QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to compare QR codes' },
      { status: 500 }
    );
  }
}
