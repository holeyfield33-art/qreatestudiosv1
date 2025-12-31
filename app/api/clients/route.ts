import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, address, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone,
        address,
        notes,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Client creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create client' },
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
    const search = searchParams.get('search');

    const where: any = { userId: session.user.id };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            qrCodes: true,
            menus: true,
          },
        },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Client fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
