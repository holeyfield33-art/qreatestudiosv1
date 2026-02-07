import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { canAccessLandingPage } from '@/lib/utils/plan-enforcement';

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
    // Check access (owner or org member)
    const hasAccess = await canAccessLandingPage(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      select: { draftContent: true },
    });

    if (!landingPage) {
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
