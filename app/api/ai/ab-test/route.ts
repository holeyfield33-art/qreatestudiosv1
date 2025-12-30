import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateABTestSuggestions } from '@/lib/services/ai-optimization-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const suggestions = await generateABTestSuggestions(body);

    return NextResponse.json({
      success: true,
      ...suggestions,
    });
  } catch (error) {
    console.error('A/B test suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate A/B test suggestions' },
      { status: 500 }
    );
  }
}
