import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const { status, action } = body;

  if (!status) {
    return NextResponse.json(
      { error: 'Status required' },
      { status: 400 }
    );
  }

  try {
    const report = await prisma.securityReport.update({
      where: { id },
      data: {
        status: status as any,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // If action is 'deactivate', deactivate the QR code
    if (action === 'deactivate' && report.qrCodeId) {
      await prisma.qRCode.update({
        where: { id: report.qrCodeId },
        data: { isActive: false },
      });
    }

    // If action is 'ban', ban the user
    if (action === 'ban' && report.qrCodeId) {
      const qrCode = await prisma.qRCode.findUnique({
        where: { id: report.qrCodeId },
        select: { userId: true },
      });

      if (qrCode?.userId) {
        await prisma.user.update({
          where: { id: qrCode.userId },
          data: { 
            isBanned: true,
            bannedAt: new Date(),
            bannedReason: `Security violation - Report #${report.id}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Report update error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
