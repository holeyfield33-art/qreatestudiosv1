import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// PATCH update menu item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user ID' }, { status: 401 });
  }

  const { itemId } = await params;
  const body = await req.json();

  try {
    const menuItem = await prisma.landingPageMenuItem.update({
      where: { id: itemId },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        category: body.category,
        available: body.available,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE menu item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user ID' }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    await prisma.landingPageMenuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
