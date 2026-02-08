import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { requireCapability } from '@/lib/env.server';

// Lazy initialization — throws ProviderNotConfiguredError if OPENAI_API_KEY is missing
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  requireCapability('ai');
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openai;
}

export const AI_FEATURES = {
  // QR Code AI
  optimizeQR: 'optimize_qr',
  suggestQRDesign: 'suggest_qr_design',
  nameQRCode: 'name_qr',
  
  // Landing Page AI
  generateLandingPage: 'generate_landing_page',
  writeCopy: 'write_copy',
  suggestImages: 'suggest_images',
  optimizeSEO: 'optimize_seo',
  
  // Branding AI
  generateBusinessNames: 'generate_names',
  generateLogoConcepts: 'generate_logo_concepts',
  generateColorPalette: 'generate_colors',
  generateTaglines: 'generate_taglines',
  
  // Content AI
  writeBlogPost: 'write_blog',
  writeSocialPost: 'write_social',
  writeEmailCopy: 'write_email',
  brainstormIdeas: 'brainstorm_ideas',
  
  // Analytics AI
  analyzePerformance: 'analyze_performance',
  predictTrends: 'predict_trends',
  suggestImprovements: 'suggest_improvements',
} as const;

export type AIFeature = typeof AI_FEATURES[keyof typeof AI_FEATURES];

// Plan limits
export const AI_USAGE_LIMITS = {
  free: {
    monthly: 0,
    features: [] as AIFeature[],
  },
  pro: {
    monthly: 100,
    features: [
      AI_FEATURES.optimizeQR,
      AI_FEATURES.suggestQRDesign,
      AI_FEATURES.writeCopy,
      AI_FEATURES.writeSocialPost,
      AI_FEATURES.nameQRCode,
    ] as AIFeature[],
  },
  business: {
    monthly: 500,
    features: Object.values(AI_FEATURES) as AIFeature[],
  },
  agency: {
    monthly: -1, // unlimited
    features: Object.values(AI_FEATURES) as AIFeature[],
  },
};

interface AICallParams {
  feature: AIFeature;
  prompt: string;
  context?: Record<string, any>;
  userId: string;
  model?: 'gpt-4o-mini' | 'gpt-4o';
}

// Main AI call function
export async function callAI({
  feature,
  prompt,
  context = {},
  userId,
  model = 'gpt-4o-mini',
}: AICallParams) {
  // Check user's remaining credits
  const canUse = await checkAICredits(userId, feature);
  if (!canUse.allowed) {
    throw new Error(canUse.message);
  }

  // Build system prompt based on feature
  const systemPrompt = getSystemPrompt(feature, context);

  // Call OpenAI
  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content || '';
  const usage = response.usage;

  // Track usage
  await incrementAIUsage(userId, feature, prompt, content, usage?.total_tokens || 0);

  return {
    content,
    usage,
  };
}

// System prompts for each feature
function getSystemPrompt(feature: AIFeature, context: Record<string, any>): string {
  const prompts: Record<AIFeature, string> = {
    [AI_FEATURES.optimizeQR]: `You are a QR code optimization expert. Analyze QR code performance data and provide specific, actionable improvements. Consider: URL length, mobile optimization, landing page quality, call-to-action clarity. Return JSON with improvements array and estimated impact.`,
    
    [AI_FEATURES.suggestQRDesign]: `You are a graphic designer specializing in QR codes. Based on the user's brand and use case, suggest: color schemes, corner styles, logo placement, frame designs. Return JSON with design suggestions.`,
    
    [AI_FEATURES.nameQRCode]: `You are a creative naming consultant. Generate clear, descriptive names for QR codes based on their purpose and destination. Return JSON array with 5 name suggestions.`,
    
    [AI_FEATURES.generateLandingPage]: `You are an expert web designer and copywriter. Create a complete landing page based on the user's description. Return JSON with: headline, subheadline, hero_text, features (array), cta_text, sections (array with titles and content). Make it conversion-focused and professional.`,
    
    [AI_FEATURES.writeCopy]: `You are a professional copywriter. Write compelling copy for ${context?.type || 'landing page'}. Consider: target audience, tone of voice, call to action. Keep it concise and persuasive. Return JSON with: headline, body, cta.`,
    
    [AI_FEATURES.suggestImages]: `You are a creative director. Based on the landing page content, suggest appropriate stock photo search queries. Return JSON array of 5 search queries that would find relevant, professional images.`,
    
    [AI_FEATURES.optimizeSEO]: `You are an SEO expert. Analyze the landing page content and provide SEO optimization suggestions. Return JSON with: meta_title, meta_description, keywords (array), content_improvements (array).`,
    
    [AI_FEATURES.generateBusinessNames]: `You are a business naming expert. Generate ${context?.count || 10} creative, memorable business name ideas based on: ${context?.industry}, ${context?.description}. Names should be: unique, easy to spell, available as .com domains (check common patterns). Return JSON array of names with brief explanations.`,
    
    [AI_FEATURES.generateLogoConcepts]: `You are a logo design consultant. Based on the business description, generate 5 logo concept descriptions that a designer could use. Include: style (modern/classic/etc), imagery suggestions, color recommendations, mood/feeling. Return JSON array.`,
    
    [AI_FEATURES.generateColorPalette]: `You are a brand color expert. Generate a professional color palette (5 colors) based on: ${context?.industry}, ${context?.mood}. Return JSON with: primary, secondary, accent, background, text colors (hex codes) plus names and use cases.`,
    
    [AI_FEATURES.generateTaglines]: `You are a tagline copywriter. Create ${context?.count || 10} memorable taglines for: ${context?.businessName}. Taglines should be: short (5-8 words), memorable, communicate value proposition. Return JSON array.`,
    
    [AI_FEATURES.writeBlogPost]: `You are a professional blog writer. Write a ${context?.length || 'medium'}-length blog post about: ${context?.topic}. Include: engaging intro, 3-5 main points, practical examples, conclusion with CTA. Optimize for SEO. Return structured JSON with: title, intro, sections (array), conclusion.`,
    
    [AI_FEATURES.writeSocialPost]: `You are a social media expert. Write ${context?.count || 5} engaging ${context?.platform || 'general'} posts about: ${context?.topic}. Include relevant hashtags and emojis where appropriate. Return JSON array of posts.`,
    
    [AI_FEATURES.writeEmailCopy]: `You are an email marketing expert. Write a conversion-focused email about: ${context?.topic}. Include: compelling subject line, personalized greeting, value proposition, clear CTA. Tone: ${context?.tone || 'professional'}. Return JSON with: subject, preview_text, body.`,
    
    [AI_FEATURES.brainstormIdeas]: `You are a creative strategist. Brainstorm ${context?.count || 10} innovative ideas for: ${context?.goal}. Consider: target audience, budget constraints, measurability. Return JSON array with ideas and brief implementation notes.`,
    
    [AI_FEATURES.analyzePerformance]: `You are a data analyst. Analyze this performance data: ${JSON.stringify(context?.data)}. Identify: key trends, anomalies, opportunities, risks. Provide actionable insights. Return JSON with: summary, insights (array), recommendations (array).`,
    
    [AI_FEATURES.predictTrends]: `You are a predictive analytics expert. Based on historical data: ${JSON.stringify(context?.data)}, predict likely trends for the next ${context?.period || '30 days'}. Return JSON with: predicted_values, confidence_level, factors, recommendations.`,
    
    [AI_FEATURES.suggestImprovements]: `You are a growth consultant. Review this data: ${JSON.stringify(context?.data)} and suggest specific improvements to: increase engagement, reduce churn, boost conversions. Return JSON with prioritized suggestions array.`,
  };

  return prompts[feature] || prompts[AI_FEATURES.optimizeQR];
}

async function checkAICredits(userId: string, feature: AIFeature) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiUsageCount: true,
        aiUsageResetDate: true,
        Subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return { allowed: false, remaining: 0, message: 'User not found' };
    }

    const tier = (user.Subscription?.plan || 'free').toLowerCase() as keyof typeof AI_USAGE_LIMITS;
    const limits = AI_USAGE_LIMITS[tier] || AI_USAGE_LIMITS.free;

    // Check if feature is available for plan
    if (!limits.features.includes(feature)) {
      return {
        allowed: false,
        remaining: 0,
        message: 'This AI feature is not available on your plan. Upgrade to access.',
      };
    }

    // Check if usage needs to be reset (monthly)
    const now = new Date();
    const resetDate = user.aiUsageResetDate || new Date();
    
    if (now >= resetDate) {
      // Reset usage
      await prisma.user.update({
        where: { id: userId },
        data: {
          aiUsageCount: 0,
          aiUsageResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      });
      
      return { allowed: true, remaining: limits.monthly, message: '' };
    }

    // Check if under limit
    const currentUsage = user.aiUsageCount || 0;
    
    if (limits.monthly === -1) {
      // Unlimited
      return { allowed: true, remaining: -1, message: '' };
    }

    if (currentUsage >= limits.monthly) {
      return {
        allowed: false,
        remaining: 0,
        message: `You've reached your monthly limit of ${limits.monthly} AI requests. Upgrade for more.`,
      };
    }

    return {
      allowed: true,
      remaining: limits.monthly - currentUsage,
      message: '',
    };
  } catch (error) {
    console.error('Error checking AI credits:', error);
    return { allowed: false, remaining: 0, message: 'Error checking AI credits' };
  }
}

async function incrementAIUsage(
  userId: string,
  feature: AIFeature,
  prompt: string,
  response: string,
  tokensUsed: number
) {
  try {
    // Increment user's usage count
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiUsageCount: {
          increment: 1,
        },
      },
    });

    // Log usage for analytics
    const cost = calculateCost(tokensUsed);
    
    await prisma.aIUsage.create({
      data: {
        userId,
        feature,
        prompt: prompt.substring(0, 1000), // Limit stored prompt length
        response: response.substring(0, 2000), // Limit stored response length
        tokensUsed,
        cost,
      },
    });
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
  }
}

function calculateCost(tokens: number): number {
  // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
  // Rough estimate: $0.40 per 1M tokens average
  return (tokens / 1000000) * 0.40;
}

export async function getRemainingCredits(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiUsageCount: true,
        aiUsageResetDate: true,
        Subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return { remaining: 0, limit: 0, resetDate: new Date() };
    }

    const tier = (user.Subscription?.plan || 'free').toLowerCase() as keyof typeof AI_USAGE_LIMITS;
    const limits = AI_USAGE_LIMITS[tier] || AI_USAGE_LIMITS.free;

    // Check if needs reset
    const now = new Date();
    const resetDate = user.aiUsageResetDate || new Date();
    
    if (now >= resetDate) {
      return {
        remaining: limits.monthly,
        limit: limits.monthly,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    }

    const currentUsage = user.aiUsageCount || 0;
    const remaining = limits.monthly === -1 ? -1 : Math.max(0, limits.monthly - currentUsage);

    return {
      remaining,
      limit: limits.monthly,
      resetDate,
    };
  } catch (error) {
    console.error('Error getting remaining credits:', error);
    return { remaining: 0, limit: 0, resetDate: new Date() };
  }
}
