import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { menuItemSchema, formatErrorResponse } from '@/lib/validation/api-schemas';

// GET menu items - Now requires authentication
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify user owns the landing page
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    const menuItems = await prisma.landingPageMenuItem.findMany({
      where: { landingPageId: id },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({ menuItems });
  } catch (err) {
    const errorResponse = formatErrorResponse(err);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

// POST new menu item - Now with validation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    // Validate input with Zod
    const validatedData = menuItemSchema.parse(body);

    // Verify user owns the landing page
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!landingPage || landingPage.userId !== session.user.id) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Create menu item with validated data
    const menuItem = await prisma.landingPageMenuItem.create({
      data: {
        landingPageId: id,
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        category: validatedData.category,
        image: validatedData.image || null,
        available: validatedData.available ?? true,
        order: validatedData.order ?? 0,
      },
    });

    return NextResponse.json({ success: true, menuItem });
  } catch (err) {
    const errorResponse = formatErrorResponse(err);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code, details: errorResponse.details },
      { status: errorResponse.statusCode }
    );
  }
}
