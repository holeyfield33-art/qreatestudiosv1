export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateBranding, validateBranding, getDefaultBranding } from '@/lib/services/white-label-service';

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrg = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { Organization: true },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const branding = userOrg.Organization.branding || getDefaultBranding();

    return NextResponse.json({
      success: true,
      branding,
      isWhiteLabel: userOrg.Organization.isWhiteLabel,
      customDomain: userOrg.Organization.customDomain,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching branding:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrg = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { 
        Organization: {
          select: {
            id: true,
            name: true,
            plan: true,
            isWhiteLabel: true,
            customDomain: true,
            branding: true,
            settings: true,
          }
        } 
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!userOrg.Organization.isWhiteLabel) {
      return NextResponse.json(
        { error: 'White-label feature not enabled for your organization' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate branding data
    const validation = validateBranding(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid branding data', errors: validation.errors },
        { status: 400 }
      );
    }

    // Merge with existing branding
    const existingBranding = (userOrg.Organization.branding as any) || getDefaultBranding();
    const updatedBranding = {
      ...existingBranding,
      ...body,
      logo: {
        ...((existingBranding as any).logo || {}),
        ...(body.logo || {}),
      },
      colors: {
        ...((existingBranding as any).colors || {}),
        ...(body.colors || {}),
      },
      fonts: {
        ...((existingBranding as any).fonts || {}),
        ...(body.fonts || {}),
      },
    };

    await updateBranding(userOrg.organizationId, updatedBranding);

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      branding: updatedBranding,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Branding update error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrg = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { Organization: true },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Reset to default branding
    await prisma.organization.update({
      where: { id: userOrg.organizationId },
      data: { branding: getDefaultBranding() as any },
    });

    return NextResponse.json({
      success: true,
      message: 'Branding reset to defaults',
      branding: getDefaultBranding(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error resetting branding:', error);
    }
    return NextResponse.json(
      { error: 'Failed to reset branding' },
      { status: 500 }
    );
  }
}
