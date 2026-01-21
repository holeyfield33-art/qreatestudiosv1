import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const orders = await prisma.printOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        QRCode: { select: { name: true, data: true } },
        User: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin print orders fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
