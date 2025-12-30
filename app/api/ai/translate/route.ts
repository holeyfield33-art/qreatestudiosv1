import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { translateContent, detectLanguage } from '@/lib/services/ai-optimization-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, targetLanguage, autoDetect } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    let target = targetLanguage;
    let detectedLanguage = 'en';

    // Auto-detect source language if requested
    if (autoDetect || !target) {
      detectedLanguage = await detectLanguage(content);
      
      // If no target specified, translate to English if source is not English
      if (!target) {
        target = detectedLanguage === 'en' ? 'es' : 'en';
      }
    }

    const translated = await translateContent(content, target);

    return NextResponse.json({
      success: true,
      original: content,
      translated,
      sourceLanguage: detectedLanguage,
      targetLanguage: target,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate content' },
      { status: 500 }
    );
  }
}
