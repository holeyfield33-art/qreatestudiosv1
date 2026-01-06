import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { callAI, AI_FEATURES, getRemainingCredits, type AIFeature } from '@/lib/ai/ai-service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Get remaining credits
    const credits = await getRemainingCredits(session.user.id);

    return NextResponse.json({
      success: true,
      data: result.content,
      usage: result.usage,
      creditsRemaining: credits.remaining,
      creditsLimit: credits.limit,
      resetDate: credits.resetDate,
    });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);

    // Handle specific errors
    if (error.message && error.message.includes('limit')) {
      return NextResponse.json(
        { 
          error: error.message, 
          upgrade: true,
          needsUpgrade: true,
        },
        { status: 403 }
      );
    }

    if (error.message && error.message.includes('not available')) {
      return NextResponse.json(
        { 
          error: error.message, 
          upgrade: true,
          needsUpgrade: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'AI request failed. Please try again.' },
      { status: 500 }
    );
  }
}
