import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkLinkHealth, generateAlternativeUrls } from '@/lib/services/ai-optimization-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const health = await checkLinkHealth(url);

    // If link is broken, generate alternatives
    if (!health.isHealthy) {
      const alternatives = await generateAlternativeUrls(url);
      
      // Test alternatives
      const testedAlternatives = await Promise.all(
        alternatives.slice(0, 3).map(async (altUrl) => {
          const altHealth = await checkLinkHealth(altUrl);
          return {
            url: altUrl,
            isHealthy: altHealth.isHealthy,
            statusCode: altHealth.statusCode,
          };
        })
      );

      return NextResponse.json({
        success: true,
        ...health,
        alternatives: testedAlternatives.filter(alt => alt.isHealthy),
      });
    }

    return NextResponse.json({
      success: true,
      ...health,
    });
  } catch (error) {
    console.error('Link check error:', error);
    return NextResponse.json(
      { error: 'Failed to check link health' },
      { status: 500 }
    );
  }
}
