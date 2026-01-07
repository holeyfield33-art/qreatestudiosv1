import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueShortCode } from '@/lib/services/qr-service';
import { generatePaymentUrl, validatePaymentHandle } from '@/lib/services/payment-service';
import { getBaseUrl } from '@/lib/utils/urls';
import { randomUUID } from 'crypto';

/**
 * POST /api/qr/payment - Create a new payment QR code
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    description,
    paymentProvider,
    paymentHandle,
    paymentAmount,
    paymentCurrency,
    paymentNote,
    allowTips,
    tipAmounts,
    clientId,
    style,
  } = body;

  // Validate required fields
  if (!name || !paymentProvider || !paymentHandle) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Validate payment handle
  const validation = validatePaymentHandle(paymentProvider, paymentHandle);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const shortCode = await generateUniqueShortCode(prisma);

    // Generate payment URL
    const redirectUrl = generatePaymentUrl(
      paymentProvider,
      paymentHandle,
      shortCode,
      paymentAmount,
      paymentCurrency || 'USD',
      paymentNote
    );

    // The QR code should contain the short URL, which will redirect to the payment URL
    const baseUrl = getBaseUrl();
    const shortUrl = `${baseUrl}/${shortCode}`;

    const qrCode = await prisma.qRCode.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        clientId: clientId || null,
        name,
        description,
        type: 'PAYMENT_LINK',
        data: shortUrl, // QR code contains the short URL
        shortCode,
        redirectUrl, // This is where it redirects to
        style: style || null,
        paymentProvider,
        paymentHandle,
        paymentAmount: paymentAmount || null,
        paymentCurrency: paymentCurrency || 'USD',
        paymentNote: paymentNote || null,
        allowTips: allowTips || false,
        tipAmounts: tipAmounts || null,
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
      console.error('Payment QR creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create payment QR' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qr/payment - Get all payment QR codes for the authenticated user
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where = {
    userId: session.user.id,
    type: 'PAYMENT_LINK' as const,
  };

  try {
    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qRCode.count({ where }),
    ]);

    return NextResponse.json({
      qrCodes: qrCodes.map((qr) => ({
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
      console.error('Payment QR fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch payment QR codes' },
      { status: 500 }
    );
  }
}
