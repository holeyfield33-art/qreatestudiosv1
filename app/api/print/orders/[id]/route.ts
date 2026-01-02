import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderShippedEmail } from '@/lib/services/email-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await prisma.printOrder.findUnique({
      where: { id },
      include: {
        QRCode: true,
        User: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Allow access to order owner or admin
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Print order fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Only admins can update orders
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, trackingNumber } = body;

    const order = await prisma.printOrder.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'shipped') updateData.shippedAt = new Date();

    const updated = await prisma.printOrder.update({
      where: { id },
      data: updateData,
    });

    // Send shipped notification email
    if (status === 'shipped' && trackingNumber) {
      try {
        await sendOrderShippedEmail(updated, trackingNumber);
      } catch (emailError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to send shipped email:', emailError);
    }
        // Continue even if email fails
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Print order update error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
