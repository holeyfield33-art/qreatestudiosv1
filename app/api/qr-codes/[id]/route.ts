import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional().nullable(),
    redirectUrl: z.string().url().max(2000).optional(),
    destinationUrl: z.string().url().max(2000).optional(),
    status: z.string().min(1).max(30).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z
      .preprocess(
        (value) => (value === null || value === undefined ? value : value),
        z.union([z.string().datetime(), z.date()]).optional().nullable()
      )
      .optional(),
    maxScans: z.number().int().positive().max(1000000).optional().nullable(),
    landingPageId: z.string().cuid().optional(),
  })
  .strict();

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
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      redirectUrl,
      destinationUrl,
      status,
      isActive,
      expiresAt,
      maxScans,
      landingPageId,
    } = parsed.data;

    const qrCode = await prisma.qRCode.findUnique({ where: { id } });
    
    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Use redirectUrl or destinationUrl (support both for compatibility)
    const urlToUpdate = redirectUrl || destinationUrl;

    const expiresAtValue =
      expiresAt === undefined
        ? undefined
        : expiresAt === null
          ? null
          : typeof expiresAt === 'string'
            ? new Date(expiresAt)
            : expiresAt;

    if (landingPageId) {
      const landingPage = await prisma.landingPage.findUnique({
        where: { id: landingPageId },
        select: { id: true, userId: true, qrCodeId: true },
      });

      if (!landingPage || landingPage.userId !== session.user.id) {
        return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
      }

      if (landingPage.qrCodeId && landingPage.qrCodeId !== id) {
        return NextResponse.json(
          { error: 'Landing page is already linked to another QR code' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.qRCode.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(urlToUpdate && { redirectUrl: urlToUpdate }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive }),
        ...(expiresAtValue !== undefined && { expiresAt: expiresAtValue }),
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
