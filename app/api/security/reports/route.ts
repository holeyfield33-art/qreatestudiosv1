import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { qrCodeId, reportType, description } = body;

  if (!qrCodeId || !reportType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const report = await prisma.securityReport.create({
      data: {
        qrCodeId,
        reportType,
        description: description || null,
        status: 'pending' as const,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const reports = await prisma.securityReport.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        qrCode: {
          select: {
            name: true,
            redirectUrl: true,
            shortCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
