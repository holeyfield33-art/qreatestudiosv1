import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ error: 'Organization name must be at least 2 characters' }, { status: 400 });
    }

    // Check if user already has an organization
    const existingMembership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, role: 'owner' },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'You already own an organization' }, { status: 409 });
    }

    // Check user's plan - only BUSINESS and AGENCY can create orgs
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const plan = subscription?.plan || 'FREE';
    if (!['BUSINESS', 'AGENCY'].includes(plan)) {
      return NextResponse.json(
        { error: 'Upgrade to Business or Agency plan to create an organization' },
        { status: 403 }
      );
    }

    // Create organization and add owner as member
    const orgId = crypto.randomUUID();
    const memberId = crypto.randomUUID();

    const [organization] = await prisma.$transaction([
      prisma.organization.create({
        data: {
          id: orgId,
          name: name.trim(),
          ownerId: session.user.id,
          plan: plan,
          updatedAt: new Date(),
        },
      }),
      prisma.organizationMember.create({
        data: {
          id: memberId,
          organizationId: orgId,
          userId: session.user.id,
          role: 'owner',
        },
      }),
    ]);

    return NextResponse.json({ success: true, organization });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function GET(_req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: {
        Organization: true,
      },
    });

    if (!membership) {
      return NextResponse.json({ success: true, organization: null });
    }

    return NextResponse.json({
      success: true,
      organization: membership.Organization,
      role: membership.role,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get organization' },
      { status: 500 }
    );
  }
}
