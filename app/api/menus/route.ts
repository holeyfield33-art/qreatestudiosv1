import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    description,
    slug,
    clientId,
    businessName,
    businessAddress,
    businessCity,
    businessState,
    businessZip,
    businessPhone,
    businessEmail,
    businessWebsite,
    language,
    currency,
  } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: 'Name and slug are required' },
      { status: 400 }
    );
  }

  try {
    // Check slug uniqueness
    const existing = await prisma.menu.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already in use' },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        clientId: clientId || null,
        name,
        description,
        slug,
        businessName,
        businessAddress,
        businessCity,
        businessState,
        businessZip,
        businessPhone,
        businessEmail,
        businessWebsite,
        language: language || 'en',
        currency: currency || 'USD',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, menu });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Menu creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where = { userId: session.user.id };

  try {
    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          Client: { select: { name: true } },
          MenuCategory: {
            include: {
              MenuItem: true,
            },
          },
        },
      }),
      prisma.menu.count({ where }),
    ]);

    return NextResponse.json({
      menus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Menu fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}
