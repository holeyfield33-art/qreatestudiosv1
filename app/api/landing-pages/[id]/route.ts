import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      include: { QRCode: true },
    });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, landingPage });
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
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    const landingPage = await prisma.landingPage.findUnique({ where: { id } });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.landingPage.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, landingPage: updated });
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
