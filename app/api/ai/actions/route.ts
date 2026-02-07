export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { performQuickAction } from '@/lib/ai/ai-action-handler';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { actionType, actionData } = body;

    if (!actionType) {
      return NextResponse.json(
        { error: 'Action type is required' },
        { status: 400 }
      );
    }

    const result = await performQuickAction(
      session.user.id,
      actionType,
      actionData || {}
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    console.error('AI Action Error:', error);
    return NextResponse.json(
      { error: 'Action failed. Please try again.' },
      { status: 500 }
    );
  }
}
