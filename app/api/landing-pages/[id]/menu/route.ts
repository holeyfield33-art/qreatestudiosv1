import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET menu items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const menuItems = await prisma.landingPageMenuItem.findMany({
      where: { landingPageId: id },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({ menuItems });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

// POST new menu item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const menuItem = await prisma.landingPageMenuItem.create({
      data: {
        landingPageId: id,
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        category: body.category,
        image: body.image,
        available: body.available ?? true,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
