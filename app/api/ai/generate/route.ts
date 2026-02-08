export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { handleApiError } from '@/lib/api-helpers';
import { applyRateLimit } from '@/lib/middleware/rate-limit';
import { prisma } from '@/lib/prisma';
import { generateText, generateJSON } from '@/lib/services/ai-adapter';
import { trackAIUsage, checkTokenLimit } from '@/lib/services/ai-usage-service';
import { sanitizeAIContext, containsExecutableCode } from '@/lib/utils/ai-sanitization';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit AI requests
  const rateLimited = await applyRateLimit(req, 'ai');
  if (rateLimited) return rateLimited;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'AI features not configured. Add OPENAI_API_KEY to enable AI tools.' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { feature, context } = body;

  if (!feature || !context) {
    return NextResponse.json(
      { error: 'Missing feature or context' },
      { status: 400 }
    );
  }

  // Sanitize context to prevent prompt injection
  const { sanitized: sanitizedContext, warnings } = sanitizeAIContext(context);

  // Log warnings in development
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('AI input sanitization warnings:', warnings);
  }

  // Check for executable code patterns
  const contextString = JSON.stringify(context);
  if (containsExecutableCode(contextString)) {
    return NextResponse.json(
      { error: 'Invalid input: Potential security risk detected' },
      { status: 400 }
    );
  }

  try {
    // Get user's subscription plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const plan = subscription?.plan || 'FREE';

    // Check token limit
    const tokenCheck = await checkTokenLimit(session.user.id, plan);
    if (!tokenCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Token limit reached for this month. Upgrade your plan for more AI generations.',
          limit: tokenCheck.limit,
          used: tokenCheck.used,
        },
        { status: 429 }
      );
    }

    let prompt = '';
    let useJSON = false;

    switch (feature) {
      case 'design-assistant':
        prompt = `You are a professional graphic designer. Generate design suggestions for:
Business: ${sanitizedContext.businessType}
Industry: ${sanitizedContext.industry}
Target Audience: ${sanitizedContext.targetAudience}

Provide 3 complete design concepts with:
1. Color palette (5 colors with hex codes)
2. Typography suggestions (font pairings)
3. Logo style direction
4. Visual mood and aesthetic

Format as JSON with keys: concepts (array of { name, colors (array), typography, logoStyle, mood })`;
        useJSON = true;
        break;

      case 'webpage-designer':
        prompt = `Create a complete landing page design and copy for:
Business: ${sanitizedContext.businessName}
Industry: ${sanitizedContext.industry}
Target Audience: ${sanitizedContext.targetAudience}
Key Message: ${sanitizedContext.keyMessage}

Generate:
1. Hero section (headline, subheadline, CTA button text)
2. Value propositions (3 benefit statements)
3. Features section (3-4 features with descriptions)
4. Social proof section (testimonial template)
5. Final CTA section

Format as JSON with keys: hero, valueProps (array), features (array), testimonial, finalCTA`;
        useJSON = true;
        break;

      case 'blog-writer':
        prompt = `Write a comprehensive, SEO-optimized blog post about:
Topic: ${sanitizedContext.topic}
Target Keywords: ${sanitizedContext.keywords}
Tone: ${sanitizedContext.tone || 'professional and engaging'}
Word Count: ${sanitizedContext.wordCount || 1000} words

Include:
- Compelling headline
- Meta description (150-160 characters)
- Introduction with hook
- 3-5 main sections with subheadings
- Actionable takeaways
- Conclusion with CTA

Write in markdown format with proper headings (##, ###).`;
        break;

      case 'ad-copy':
        prompt = `Create ${sanitizedContext.variations || 3} high-converting ad copy variations for:
Platform: ${sanitizedContext.platform || 'Facebook/Instagram'}
Product/Service: ${sanitizedContext.product}
Target Audience: ${sanitizedContext.audience}
Key Benefit: ${sanitizedContext.benefit}
CTA: ${sanitizedContext.cta || 'Learn More'}

For ${sanitizedContext.platform === 'Google' ? 'Google Ads' : 'social media'}, each ad should have:
- Attention-grabbing hook
- Clear benefit statement
- Strong call-to-action
${sanitizedContext.platform === 'Facebook' ? '- Under 125 characters' : ''}

Format as JSON with key: ads (array of { headline, body, cta })`;
        useJSON = true;
        break;

      case 'social-media':
        prompt = `Generate ${sanitizedContext.count || 5} social media posts for:
Platform: ${sanitizedContext.platform}
Topic: ${sanitizedContext.topic}
Brand Voice: ${sanitizedContext.voice || 'professional yet approachable'}
Include Hashtags: ${sanitizedContext.includeHashtags !== false ? 'yes' : 'no'}

Each post should:
- Hook readers in first line
- Provide value or insight
- Include a CTA or question
- Be platform-appropriate length
${sanitizedContext.includeHashtags !== false ? '- Include 3-5 relevant hashtags' : ''}

Format as JSON with key: posts (array of strings)`;
        useJSON = true;
        break;

      case 'email-template':
        prompt = `Create a professional email template for:
Purpose: ${sanitizedContext.purpose}
Audience: ${sanitizedContext.audience}
Tone: ${sanitizedContext.tone || 'professional'}

Generate:
- Subject line (attention-grabbing, under 50 characters)
- Preview text
- Email body (opening, main content, closing)
- Clear CTA
- P.S. statement (if appropriate)

Format as JSON with keys: subject, preview, body, cta, ps`;
        useJSON = true;
        break;

      case 'menu-description':
        prompt = `Write appetizing menu item descriptions for:
${sanitizedContext.items.map((item: any, i: number) => `${i + 1}. ${item.name} - ${item.ingredients || 'no ingredients listed'}`).join('\n')}

Style: ${sanitizedContext.style || 'upscale casual'}
Cuisine: ${sanitizedContext.cuisine || 'contemporary'}

For each item, write 2-3 sentences that:
- Use sensory language
- Highlight key ingredients
- Create desire
- Match the cuisine style

Format as JSON with key: descriptions (array matching input order)`;
        useJSON = true;
        break;

      case 'business-proposal':
        prompt = `Generate a professional business proposal for:
Client: ${sanitizedContext.clientName}
Services: ${sanitizedContext.services}
Project Timeline: ${sanitizedContext.timeline}
Budget Range: ${sanitizedContext.budget}

Include:
1. Executive Summary
2. Problem Statement
3. Proposed Solution
4. Scope of Work (detailed)
5. Timeline & Milestones
6. Investment Breakdown
7. Why Choose Us
8. Next Steps

Write in markdown format with clear sections.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid feature' }, { status: 400 });
    }

    // Generate content
    let content: any;
    let tokensUsed: any;
    let cost: number;
    let responseText: string = '';

    if (useJSON) {
      const result = await generateJSON(prompt);
      content = result.data;
      tokensUsed = result.tokensUsed;
      cost = result.cost;
      responseText = JSON.stringify(result.data);
    } else {
      const result = await generateText(prompt);
      content = result.content;
      tokensUsed = result.tokensUsed;
      cost = result.cost;
      responseText = result.content;
    }

    // Track usage
    await trackAIUsage(session.user.id, feature, tokensUsed, cost, prompt, responseText);

    return NextResponse.json({
      success: true,
      content,
      usage: {
        tokens: tokensUsed,
        cost,
        remaining: tokenCheck.remaining - tokensUsed.total,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, 'ai/generate');
  }
}
