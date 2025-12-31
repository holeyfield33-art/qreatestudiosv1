import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber, calculatePrintPrice } from '@/lib/services/print-service';
import { sendPrintOrderAdminEmail, sendPrintOrderCustomerEmail } from '@/lib/services/email-service';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      qrCodeId,
      productType,
      quantity,
      specifications,
      specialInstructions,
      shippingAddress,
      customerEmail,
      customerPhone,
    } = body;

    if (!qrCodeId || !productType || !quantity || !specifications || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Calculate price
    const totalPrice = calculatePrintPrice(productType, quantity, specifications);

    if (totalPrice === 0) {
      return NextResponse.json(
        { error: 'Invalid product configuration' },
        { status: 400 }
      );
    }

    // Create order
    const orderNumber = generateOrderNumber();

    const order = await prisma.printOrder.create({
      data: {
        userId: session.user.id,
        qrCodeId,
        orderNumber,
        productType,
        quantity,
        specifications,
        specialInstructions,
        shippingAddress,
        totalPrice,
        customerEmail: customerEmail || session.user.email,
        customerPhone,
        status: 'pending',
      },
      include: {
        qrCode: true,
        user: true,
      },
    });

    // Send notification emails
    try {
      await Promise.all([
        sendPrintOrderAdminEmail(order, qrCode, order.user),
        sendPrintOrderCustomerEmail(order, order.user),
      ]);
      
      // Update notification flags
      await prisma.printOrder.update({
        where: { id: order.id },
        data: {
          adminNotificationSent: true,
          customerNotificationSent: true,
        },
      });
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Email notification error:', emailError);
    }
      // Continue even if emails fail
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Print order error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { userId: session.user.id };
    if (status && status !== 'all') where.status = status;

    const orders = await prisma.printOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        qrCode: { select: { name: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Print orders fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
