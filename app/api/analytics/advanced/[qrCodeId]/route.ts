import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAdvancedAnalytics } from '@/lib/services/analytics-enhancement';

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

    // Parse date range from query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    // Get advanced analytics
    const analytics = await getAdvancedAnalytics(qrCodeId, startDate, endDate);

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
      },
      analytics,
    });
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
