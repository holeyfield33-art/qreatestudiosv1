import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueShortCode } from '@/lib/services/qr-service';
import { getBaseUrl } from '@/lib/utils/urls';
import { canCreateQR } from '@/lib/services/usage-enforcement';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check usage limits
  const usageCheck = await canCreateQR(session.user.id);
  if (!usageCheck.allowed) {
    return NextResponse.json(
      { 
        error: usageCheck.reason,
        limit: usageCheck.limit,
        current: usageCheck.current,
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
    name,
    description,
    type,
    data,
    redirectUrl,
    clientId,
    style,
    logoUrl,
    isSecure,
    password,
    expiresAt,
    maxScans,
  } = body;

  // Validate required fields
  if (!name || !type || !redirectUrl) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const shortCode = await generateUniqueShortCode(prisma);
    const baseUrl = getBaseUrl();
    const shortUrl = `${baseUrl}/${shortCode}`;

    const qrCode = await prisma.qRCode.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        clientId: clientId || null,
        name,
        description,
        type,
        data: shortUrl, // QR code contains the short URL for redirect tracking
        shortCode,
        redirectUrl,
        style: style || null,
        logoUrl: logoUrl || null,
        isSecure: isSecure || false,
        password: password || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxScans: maxScans || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      qrCode: {
        ...qrCode,
        shortUrl: `${getBaseUrl()}/${qrCode.shortCode}`,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
        console.error('QR creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create QR code' },
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = { userId: session.user.id };
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          Client: { select: { name: true } },
        },
      }),
      prisma.qRCode.count({ where }),
    ]);

    return NextResponse.json({
      qrCodes: qrCodes.map((qr: any) => ({
        ...qr,
        shortUrl: `${getBaseUrl()}/${qr.shortCode}`,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
        console.error('QR list fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}
