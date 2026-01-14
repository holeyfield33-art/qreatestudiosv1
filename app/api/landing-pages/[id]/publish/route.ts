import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      select: { userId: true, draftContent: true },
    });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Copy draft content to published content and mark as published
    const updated = await prisma.landingPage.update({
      where: { id },
      data: {
        publishedContent: landingPage.draftContent as any,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, landingPage: updated });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page publish error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to publish landing page' },
      { status: 500 }
    );
  }
}
