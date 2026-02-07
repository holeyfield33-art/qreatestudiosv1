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

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { title, slug, content, theme, qrCodeId, clientId, templateId, draftContent, metadata } = body;

  if (!title || !slug) {
    return NextResponse.json(
      { error: 'Title and slug required' },
      { status: 400 }
    );
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must be lowercase alphanumeric with hyphens only' },
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

    // Use transaction to ensure atomicity and prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check slug uniqueness within transaction (locks the row)
      const existing = await tx.landingPage.findUnique({
        where: { slug },
        select: { id: true }
      });

      if (existing) {
        throw new Error('SLUG_TAKEN');
      }

      // Create landing page
      const landingPage = await tx.landingPage.create({
        data: {
          id: randomUUID(),
          userId: session.user.id,
          qrCodeId: qrCodeId || null,
          templateId: templateId || null,
          name: title,
          slug,
          content: content || {},
          draftContent: draftContent || content || {},
          metadata: metadata || theme || {},
          isPublished: false,
          updatedAt: new Date(),
        },
      });

      // If connecting to a QR code, update the QR with the landing page URL
      if (qrCodeId) {
        // Verify user owns the QR code
        const qrCode = await tx.qRCode.findUnique({
          where: { id: qrCodeId },
          select: { userId: true }
        });

        if (!qrCode || qrCode.userId !== session.user.id) {
          throw new Error('QR_CODE_NOT_FOUND');
        }

        await tx.qRCode.update({
          where: { id: qrCodeId },
          data: {
            redirectUrl: getLandingPageUrl(slug),
          },
        });
      }

      return landingPage;
    });

    return NextResponse.json({ success: true, landingPage: result });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page creation error:', error);
    }

    // Handle custom errors
    if (error.message === 'SLUG_TAKEN') {
      return NextResponse.json(
        { error: 'Slug already in use', code: 'SLUG_TAKEN' },
        { status: 409 }
      );
    }

    if (error.message === 'QR_CODE_NOT_FOUND') {
      return NextResponse.json(
        { error: 'QR code not found or access denied', code: 'QR_CODE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A landing page with this slug already exists', code: 'UNIQUE_CONSTRAINT' },
        { status: 409 }
      );
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
