import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const body = await req.json();
    const { reportType, description, qrCodeId } = body;

    // Validate required fields
    if (!qrCodeId || !reportType) {
      return NextResponse.json(
        { error: 'QR code ID and report type are required' },
        { status: 400 }
      );
    }

    // Verify QR code exists
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Get request metadata
    const forwarded = req.headers.get('x-forwarded-for');
    const reporterIp = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent');

    // Create security report
    const report = await prisma.securityReport.create({
      data: {
        qrCodeId,
        reportType,
        description: description || null,
        reporterIp,
        userAgent,
        status: 'pending',
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SECURITY_REPORT_SUBMITTED',
        resourceType: 'SecurityReport',
        resourceId: report.id,
        metadata: {
          qrCodeId,
          reportType,
          reporterIp,
        },
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Report received. Our security team will review it shortly.',
      reportId: report.id,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Security report error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
