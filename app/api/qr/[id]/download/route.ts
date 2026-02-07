export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateStyledQRCode } from '@/lib/services/qr-service';
import { getShortUrl } from '@/lib/utils/urls';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'png';
  
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const qrCode = await prisma.qRCode.findUnique({ where: { id } });
  
  if (!qrCode || qrCode.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const qrData = getShortUrl(qrCode.shortCode);
  const style = (qrCode.style || {}) as { width?: number; margin?: number; darkColor?: string; lightColor?: string };
  const result = await generateStyledQRCode(qrData, style, qrCode.logoUrl || undefined);

  const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
  const extension = format === 'svg' ? 'svg' : 'png';

  return new NextResponse(result.buffer as any, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${qrCode.name.replace(/[^a-z0-9]/gi, '_')}.${extension}"`,
    },
  });
}
