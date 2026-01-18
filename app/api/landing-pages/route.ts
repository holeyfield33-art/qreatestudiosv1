import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { getLandingPageUrl } from '@/lib/utils/url-helpers';
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access';

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user ID in session' }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, content, theme, qrCodeId, clientId, templateId, draftContent, metadata } = body;

  if (!title || !slug) {
    return NextResponse.json(
      { error: 'Title and slug required' },
      { status: 400 }
    );
  }

  try {
    // Verify user exists
    const userExists = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      select: { id: true }
    });
    
    if (!userExists) {
      return NextResponse.json({ 
        error: 'User not found in database. Please sign out and sign in again.',
        code: 'USER_NOT_FOUND'
      }, { status: 400 });
    }
    
    // Check if template is premium and user has access
    if (templateId) {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        select: { isPremium: true, isActive: true }
      });
      
      if (!template) {
        return NextResponse.json({ 
          error: 'Template not found',
          code: 'TEMPLATE_NOT_FOUND'
        }, { status: 404 });
      }
      
      if (!template.isActive) {
        return NextResponse.json({ 
          error: 'Template is not available',
          code: 'TEMPLATE_INACTIVE'
        }, { status: 400 });
      }
      
      if (template.isPremium) {
        const userPlan = (session.user.organization?.plan as PlanType) || 'FREE';
        const featureAccess = getFeatureAccess(userPlan);
        
        if (!featureAccess.canAccessPremiumTemplates) {
          return NextResponse.json({ 
            error: 'Premium template requires Business or Agency plan',
            code: 'PREMIUM_TEMPLATE_REQUIRED',
            requiredPlan: 'BUSINESS'
          }, { status: 403 });
        }
      }
    }

    // Check slug uniqueness
    const existing = await prisma.landingPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        qrCodeId: qrCodeId || null,
        templateId: templateId || null, // Support for Puck templates
        name: title,
        slug,
        content: content || {},
        draftContent: draftContent || content || {}, // Use template's defaultSections
        metadata: metadata || theme || {},
        isPublished: false,
        updatedAt: new Date(),
      },
    });

    // If connecting to a QR code, update the QR with the landing page URL
    if (qrCodeId) {
      await prisma.qRCode.update({
        where: { id: qrCodeId, userId: session.user.id },
        data: {
          redirectUrl: getLandingPageUrl(slug),
        },
      });
    }

    return NextResponse.json({ success: true, landingPage });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page creation error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create landing page' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user ID in session' }, { status: 401 });
  }

  try {
    const landingPages = await prisma.landingPage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        QRCode: { select: { name: true, shortCode: true } },
      },
    });

    return NextResponse.json({ success: true, landingPages });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing pages fetch error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing pages' },
      { status: 500 }
    );
  }
}
