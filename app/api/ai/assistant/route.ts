export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { handleApiError } from '@/lib/api-helpers';
import { applyRateLimit } from '@/lib/middleware/rate-limit';
import { callAI, AI_FEATURES, getRemainingCredits, type AIFeature } from '@/lib/ai/ai-service';
import { executeAIAction } from '@/lib/ai/ai-action-handler';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit AI requests
    const rateLimited = await applyRateLimit(req, 'ai');
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const { feature, prompt, context, model } = body;

    // Validate feature
    if (!Object.values(AI_FEATURES).includes(feature)) {
      return NextResponse.json(
        { error: 'Invalid AI feature' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call AI
    const result = await callAI({
      feature: feature as AIFeature,
      prompt,
      context: context || {},
      userId: session.user.id,
      model: model || 'gpt-4o-mini',
    });

    // Execute actual actions based on AI response
    const action = await executeAIAction(
      session.user.id,
      feature,
      result.content,
      { ...context, prompt }
    );

    // Get remaining credits
    const credits = await getRemainingCredits(session.user.id);

    return NextResponse.json({
      success: true,
      result: result.content,
      action: action,
      tokensUsed: result.usage?.total_tokens,
      creditsRemaining: credits.remaining,
      creditsLimit: credits.limit,
      resetDate: credits.resetDate,
    });
  } catch (error: unknown) {
    // Handle credit limit errors specifically
    if (error instanceof Error && error.message.includes('limit')) {
      return NextResponse.json(
        { error: { code: 'LIMIT_REACHED', message: error.message }, upgradeRequired: true },
        { status: 403 }
      );
    }
    return handleApiError(error, 'ai/assistant');
  }
}
