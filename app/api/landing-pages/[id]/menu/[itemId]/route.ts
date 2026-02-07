export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { menuItemUpdateSchema, formatErrorResponse } from '@/lib/validation/api-schemas';

// PATCH update menu item - Now with validation and ownership check
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: _id, itemId } = await params;

  try {
    const body = await req.json();

    // Validate input with Zod (partial update)
    const validatedData = menuItemUpdateSchema.parse(body);

    // Verify ownership: check if menu item belongs to user's landing page
    const menuItem = await prisma.landingPageMenuItem.findUnique({
      where: { id: itemId },
      include: {
        landingPage: {
          select: { userId: true },
        },
      },
    });

    if (!menuItem || menuItem.landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Build update data (only include defined fields)
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.available !== undefined) updateData.available = validatedData.available;
    if (validatedData.order !== undefined) updateData.order = validatedData.order;

    const updated = await prisma.landingPageMenuItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ success: true, menuItem: updated });
  } catch (err) {
    const errorResponse = formatErrorResponse(err);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code, details: errorResponse.details },
      { status: errorResponse.statusCode }
    );
  }
}

// DELETE menu item - Now with ownership check
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: _id, itemId } = await params;

  try {
    // Verify ownership: check if menu item belongs to user's landing page
    const menuItem = await prisma.landingPageMenuItem.findUnique({
      where: { id: itemId },
      include: {
        landingPage: {
          select: { userId: true },
        },
      },
    });

    if (!menuItem || menuItem.landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    await prisma.landingPageMenuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorResponse = formatErrorResponse(err);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
