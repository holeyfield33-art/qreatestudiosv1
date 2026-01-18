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

    return NextResponse.json({ 
      success: true, 
      landingPage: {
        ...landingPage,
        title: landingPage.name,
        published: landingPage.isPublished
      }
    });
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

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

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
    
    // Validate and sanitize draftContent (Puck JSON format)
    if (body.draftContent !== undefined) {
      const draftContent = body.draftContent;
      
      // Ensure it's an object with proper structure
      if (typeof draftContent === 'object' && draftContent !== null) {
        updateData.draftContent = {
          content: Array.isArray(draftContent.content) ? draftContent.content : [],
          root: draftContent.root || { props: {} },
          zones: draftContent.zones || {}
        };
      } else {
        return NextResponse.json(
          { error: 'Invalid draftContent format. Expected Puck JSON structure.' },
          { status: 400 }
        );
      }
    }
    
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
      landingPage: {
        ...updated,
        title: updated.name,
        published: updated.isPublished
      }
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
