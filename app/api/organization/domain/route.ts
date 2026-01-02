import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { setCustomDomain, removeDomain } from '@/lib/services/white-label-service';

export async function POST(req: Request) {
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

    const { domain } = await req.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Clean and normalize domain
    const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '');

    const result = await setCustomDomain(userOrg.organizationId, cleanDomain);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      message: 'Domain configured successfully. Please add the DNS records below.',
      dnsRecords: [
        {
          type: 'A',
          name: '@',
          value: '76.76.21.21',
          ttl: 3600,
          description: 'Root domain points to hosting',
        },
        {
          type: 'CNAME',
          name: 'www',
          value: 'cname.vercel-dns.com',
          ttl: 3600,
          description: 'WWW subdomain points to Vercel',
        },
      ],
      instructions: [
        'Log in to your domain registrar (GoDaddy, Namecheap, etc.)',
        'Navigate to DNS Management',
        'Add the A record and CNAME record shown above',
        'Wait 5-60 minutes for DNS propagation',
        'SSL certificate will be generated automatically',
        'Your white-label platform will be accessible at your custom domain',
      ],
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Domain configuration error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to configure domain' },
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

    const userOrg = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { Organization: true },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    await removeDomain(userOrg.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed successfully',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error removing domain:', error);
    }
    return NextResponse.json(
      { error: 'Failed to remove domain' },
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

    const userOrg = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { Organization: true },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customDomain: userOrg.Organization.customDomain,
      isWhiteLabel: userOrg.Organization.isWhiteLabel,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching domain:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch domain' },
      { status: 500 }
    );
  }
}
