import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const qrCode = await prisma.qRCode.findUnique({
    where: { id },
    include: {
      client: true,
      analytics: {
        take: 10,
        orderBy: { scannedAt: 'desc' },
      },
    },
  });

  if (!qrCode || qrCode.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ qrCode });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
