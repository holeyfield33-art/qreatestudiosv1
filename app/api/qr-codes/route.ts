import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Helper to generate unique short code
async function generateShortCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
    const existing = await prisma.qRCode.findFirst({
      where: { shortCode: code },
    });

    if (!existing) {
      return code;
    }

    attempts++;
  }

  throw new Error('Unable to generate unique short code');
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type,
      destinationUrl,
      shortCode,
      shortUrl,
      style,
      description,
      maxScans,
      content,
    } = body;

    // Validate required fields
    if (!name || !type || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, and destinationUrl are required' },
        { status: 400 }
      );
    }

    // Generate short code if not provided
    const finalShortCode = shortCode || await generateShortCode();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalShortUrl = shortUrl || `${baseUrl}/s/${finalShortCode}`;

    // Create QR code in database with all advanced features
    const qrCode = await prisma.qRCode.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        name,
        description: description || null,
        type: type.toUpperCase(),
        data: content || destinationUrl, // Store form data or destination URL
        shortCode: finalShortCode,
        redirectUrl: destinationUrl,
        style: style || {
          fgColor: '#000000',
          bgColor: '#FFFFFF',
          dotStyle: 'square',
          cornerStyle: 'square',
          errorCorrectionLevel: 'M',
        },
        logoUrl: style?.logo?.url || null,
        isActive: true,
        scanCount: 0,
        maxScans: maxScans || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: qrCode.id,
      name: qrCode.name,
      type: qrCode.type,
      shortCode: qrCode.shortCode,
      shortUrl: finalShortUrl,
      destinationUrl: qrCode.redirectUrl,
      style: qrCode.style,
      createdAt: qrCode.createdAt,
    });
  } catch (error) {
    console.error('QR creation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create QR code',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
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

    // Get all QR codes for the user
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        type: true,
        shortCode: true,
        redirectUrl: true,
        scanCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ qrCodes });
  } catch (error) {
    console.error('QR fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}
