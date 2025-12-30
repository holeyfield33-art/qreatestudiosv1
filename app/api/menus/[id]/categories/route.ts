import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, displayOrder } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Verify menu ownership
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu || menu.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const category = await prisma.menuCategory.create({
      data: {
        menuId: id,
        name,
        description,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
