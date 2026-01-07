import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        LandingPage: true,
        Client: true,
        Analytics: {
          take: 10,
          orderBy: { scannedAt: 'desc' },
        },
      },
    });

    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, qrCode });
  } catch (error) {
    console.error('QR fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, redirectUrl, destinationUrl, status, isActive, expiresAt, maxScans, landingPageId } = body;

    const qrCode = await prisma.qRCode.findUnique({ where: { id } });
    
    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Use redirectUrl or destinationUrl (support both for compatibility)
    const urlToUpdate = redirectUrl || destinationUrl;

    const updated = await prisma.qRCode.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(urlToUpdate && { redirectUrl: urlToUpdate }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(maxScans !== undefined && { maxScans }),
      },
    });

    // If landingPageId is provided, update the LandingPage relation
    if (landingPageId) {
      await prisma.landingPage.update({
        where: { id: landingPageId },
        data: { qrCodeId: id },
      });
    }

    return NextResponse.json({ success: true, qrCode: updated });
  } catch (error) {
    console.error('QR update error:', error);
    return NextResponse.json(
      { error: 'Failed to update QR code' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await prisma.qRCode.findUnique({ where: { id } });
    
    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.qRCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    );
  }
}
