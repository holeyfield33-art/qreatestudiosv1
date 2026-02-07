export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { status } = await req.json();

    if (!['paid', 'encoding', 'encoded', 'shipped', 'delivered'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { orderId } = await params;

    const order = await prisma.printOrder.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
