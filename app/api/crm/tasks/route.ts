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
    const { title, description, contactId, dueDate, priority } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        contactId: contactId || null,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        status: 'pending',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Task creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
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
    const status = searchParams.get('status');
    const contactId = searchParams.get('contactId');

    const where: any = { userId: session.user.id };
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        Contact: { select: { name: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Task fetch error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
