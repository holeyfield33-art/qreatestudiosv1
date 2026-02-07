export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, contactId } = body;

    if (!content || !contactId) {
      return NextResponse.json(
        { error: 'Content and contactId are required' },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        contactId,
        content,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Note creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create note' },
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
    const contactId = searchParams.get('contactId');
    const search = searchParams.get('search');

    const where: any = { userId: session.user.id };
    if (contactId) where.contactId = contactId;
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        Contact: { select: { name: true } },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Note fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}
