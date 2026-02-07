import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Set custom domain for a landing page
export async function PUT(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { domain } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Check ownership
    const page = await prisma.landingPage.findUnique({ where: { id } });
    if (!page || page.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if domain is already in use
    const existingPage = await prisma.landingPage.findFirst({
      where: { customDomain: domain, id: { not: id } },
    });
    if (existingPage) {
      return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 });
    }

    // Check plan access (custom domains require BUSINESS+ plan)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = subscription?.plan || 'FREE';
    if (!['BUSINESS', 'AGENCY'].includes(plan)) {
      return NextResponse.json(
        { error: 'Custom domains require Business or Agency plan' },
        { status: 403 }
      );
    }

    const updated = await prisma.landingPage.update({
      where: { id },
      data: { customDomain: domain },
    });

    return NextResponse.json({
      success: true,
      domain: updated.customDomain,
      dnsInstructions: {
        type: 'CNAME',
        name: domain,
        value: 'cname.qreatestudios.com',
        note: 'Add this CNAME record to your DNS provider. SSL will be automatically provisioned.',
      },
    });
  } catch (error) {
    console.error('Domain config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to configure domain' },
      { status: 500 }
    );
  }
}

// Remove custom domain
export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = await prisma.landingPage.findUnique({ where: { id } });
    if (!page || page.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.landingPage.update({
      where: { id },
      data: { customDomain: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Domain removal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove domain' },
      { status: 500 }
    );
  }
}
