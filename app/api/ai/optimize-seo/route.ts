export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateSEOOptimizations } from '@/lib/services/ai-optimization-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    const seoData = await generateSEOOptimizations(content, title);

    return NextResponse.json({
      success: true,
      ...seoData,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SEO optimization error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to generate SEO optimizations' },
      { status: 500 }
    );
  }
}
