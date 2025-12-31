import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateText, generateJSON } from '@/lib/services/ai-adapter';
import { trackAIUsage, checkTokenLimit } from '@/lib/services/ai-usage-service';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
Business: ${context.businessType}
Industry: ${context.industry}
Target Audience: ${context.targetAudience}

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
Business: ${context.businessName}
Industry: ${context.industry}
Target Audience: ${context.targetAudience}
Key Message: ${context.keyMessage}

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
Topic: ${context.topic}
Target Keywords: ${context.keywords}
Tone: ${context.tone || 'professional and engaging'}
Word Count: ${context.wordCount || 1000} words

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
        prompt = `Create ${context.variations || 3} high-converting ad copy variations for:
Platform: ${context.platform || 'Facebook/Instagram'}
Product/Service: ${context.product}
Target Audience: ${context.audience}
Key Benefit: ${context.benefit}
CTA: ${context.cta || 'Learn More'}

For ${context.platform === 'Google' ? 'Google Ads' : 'social media'}, each ad should have:
- Attention-grabbing hook
- Clear benefit statement
- Strong call-to-action
${context.platform === 'Facebook' ? '- Under 125 characters' : ''}

Format as JSON with key: ads (array of { headline, body, cta })`;
        useJSON = true;
        break;

      case 'social-media':
        prompt = `Generate ${context.count || 5} social media posts for:
Platform: ${context.platform}
Topic: ${context.topic}
Brand Voice: ${context.voice || 'professional yet approachable'}
Include Hashtags: ${context.includeHashtags !== false ? 'yes' : 'no'}

Each post should:
- Hook readers in first line
- Provide value or insight
- Include a CTA or question
- Be platform-appropriate length
${context.includeHashtags !== false ? '- Include 3-5 relevant hashtags' : ''}

Format as JSON with key: posts (array of strings)`;
        useJSON = true;
        break;

      case 'email-template':
        prompt = `Create a professional email template for:
Purpose: ${context.purpose}
Audience: ${context.audience}
Tone: ${context.tone || 'professional'}

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
${context.items.map((item: any, i: number) => `${i + 1}. ${item.name} - ${item.ingredients || 'no ingredients listed'}`).join('\n')}

Style: ${context.style || 'upscale casual'}
Cuisine: ${context.cuisine || 'contemporary'}

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
Client: ${context.clientName}
Services: ${context.services}
Project Timeline: ${context.timeline}
Budget Range: ${context.budget}

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

    if (useJSON) {
      const result = await generateJSON(prompt);
      content = result.data;
      tokensUsed = result.tokensUsed;
      cost = result.cost;
    } else {
      const result = await generateText(prompt);
      content = result.content;
      tokensUsed = result.tokensUsed;
      cost = result.cost;
    }

    // Track usage
    await trackAIUsage(session.user.id, feature, tokensUsed, cost);

    return NextResponse.json({
      success: true,
      content,
      usage: {
        tokens: tokensUsed,
        cost,
        remaining: tokenCheck.remaining - tokensUsed.total,
      },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('AI generation error:', error);
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
