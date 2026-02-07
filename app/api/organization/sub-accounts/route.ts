export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID, randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
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
    const { name, email, role } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create sub-account
    const subAccount = await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
        isSubAccount: true,
        parentOrganizationId: userOrg.organizationId,
        updatedAt: new Date(),
      },
    });

    // Add to organization
    await prisma.organizationMember.create({
      data: {
        id: randomUUID(),
        userId: subAccount.id,
        organizationId: userOrg.organizationId,
        role: role || 'MEMBER',
      },
    });

    return NextResponse.json({
      success: true,
      subAccount: {
        id: subAccount.id,
        name: subAccount.name,
        email: subAccount.email,
      },
      tempPassword,
      message: 'Sub-account created successfully. Share the temporary password securely.',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Sub-account creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create sub-account' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
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
        { error: 'White-label feature not enabled' },
        { status: 403 }
      );
    }

    // Get all sub-accounts
    const subAccounts = await prisma.user.findMany({
      where: {
        parentOrganizationId: userOrg.organizationId,
        isSubAccount: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        OrganizationMember: {
          where: { organizationId: userOrg.organizationId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      subAccounts: subAccounts.map(account => ({
        id: account.id,
        name: account.name,
        email: account.email,
        createdAt: account.createdAt,
        role: account.OrganizationMember?.[0]?.role || 'MEMBER',
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching sub-accounts:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch sub-accounts' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subAccountId = searchParams.get('id');

    if (!subAccountId) {
      return NextResponse.json({ error: 'Sub-account ID required' }, { status: 400 });
    }

    // Get user's organization
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
            settings: true,
          }
        } 
      },
    });

    if (!userOrg?.Organization.isWhiteLabel) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Verify sub-account belongs to this organization
    const subAccount = await prisma.user.findFirst({
      where: {
        id: subAccountId,
        parentOrganizationId: userOrg.organizationId,
        isSubAccount: true,
      },
    });

    if (!subAccount) {
      return NextResponse.json({ error: 'Sub-account not found' }, { status: 404 });
    }

    // Delete sub-account
    await prisma.user.delete({
      where: { id: subAccountId },
    });

    return NextResponse.json({
      success: true,
      message: 'Sub-account deleted successfully',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting sub-account:', error);
    }
    return NextResponse.json(
      { error: 'Failed to delete sub-account' },
      { status: 500 }
    );
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  const bytes = randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(bytes[i] % chars.length);
  }
  return password;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
