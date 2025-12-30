import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getQRAnalytics } from '@/lib/services/analytics-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  const { qrCodeId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: qrCodeId },
  });

  if (!qrCode || qrCode.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : undefined;
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : undefined;

  try {
    const analytics = await getQRAnalytics(qrCodeId, startDate, endDate);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
