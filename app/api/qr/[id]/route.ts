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

    return NextResponse.json({ qrCode });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
        console.error('QR fetch error:', error);
    }
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
    const { name, description, redirectUrl, status, isActive, expiresAt, maxScans } = body;

    const qrCode = await prisma.qRCode.findUnique({ where: { id } });
    
    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.qRCode.update({
      where: { id },
      data: {
        name,
        description,
        redirectUrl,
        status,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxScans,
      },
    });

    return NextResponse.json({ success: true, qrCode: updated });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
        console.error('QR update error:', error);
    }
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
    if (process.env.NODE_ENV === 'development') {
        console.error('QR delete error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    );
  }
}
