import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, price, imageUrl, isAvailable, dietaryTags, displayOrder } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    // Verify ownership through category -> menu
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: { menu: true },
    });

    if (!category || category.menu.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        description,
        price,
        imageUrl,
        isAvailable: isAvailable !== false,
        dietaryTags,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Menu item creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
