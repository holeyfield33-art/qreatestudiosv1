import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user ID' }, { status: 401 });
  }

  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      include: { 
        QRCode: true,
        Template: true,
        RestaurantMenu: true,
      },
    });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Return the landing page with proper field mapping
    return NextResponse.json(landingPage);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page fetch error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing page' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user ID' }, { status: 401 });
  }

  const body = await req.json();

  try {
    const landingPage = await prisma.landingPage.findUnique({ where: { id } });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Map frontend fields to database fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.draftContent !== undefined) updateData.draftContent = body.draftContent;
    if (body.publishedContent !== undefined) updateData.publishedContent = body.publishedContent;
    if (body.qrCodeId !== undefined) updateData.qrCodeId = body.qrCodeId;
    if (body.customDomain !== undefined) updateData.customDomain = body.customDomain;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    if (body.seo !== undefined) updateData.seo = body.seo;

    // If publishing, set publishedAt timestamp
    if (body.isPublished === true && !landingPage.isPublished) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.landingPage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      landingPage: updated
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page update error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update landing page' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const landingPage = await prisma.landingPage.findUnique({ where: { id } });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.landingPage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page delete error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete landing page' },
      { status: 500 }
    );
  }
}
