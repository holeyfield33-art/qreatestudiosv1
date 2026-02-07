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
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the caller's organization
    const callerMembership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { Organization: true },
    });

    if (!callerMembership || !['owner', 'admin'].includes(callerMembership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found. They must create an account first.' }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: callerMembership.organizationId,
          userId: userToAdd.id,
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
    }

    // Check team seat limits
    const { getFeatureAccess } = await import('@/lib/utils/feature-access');
    const plan = callerMembership.Organization.plan as any;
    const access = getFeatureAccess(plan);

    if (access.maxTeamSeats !== -1) {
      const currentMemberCount = await prisma.organizationMember.count({
        where: { organizationId: callerMembership.organizationId }
      });

      if (currentMemberCount >= access.maxTeamSeats) {
        return NextResponse.json(
          { error: `Team seat limit reached (${access.maxTeamSeats}). Upgrade your plan for more seats.` },
          { status: 403 }
        );
      }
    }

    // Add member
    const member = await prisma.organizationMember.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: callerMembership.organizationId,
        userId: userToAdd.id,
        role: role,
      },
      include: {
        User: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Find the caller's organization
    const callerMembership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!callerMembership || !['owner', 'admin'].includes(callerMembership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Find the member to remove
    const memberToRemove = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove || memberToRemove.organizationId !== callerMembership.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove the owner
    if (memberToRemove.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove the organization owner' }, { status: 403 });
    }

    await prisma.organizationMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
