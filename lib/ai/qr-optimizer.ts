import { prisma } from '@/lib/prisma';
import { getQRAnalytics } from '@/lib/services/analytics-service';
import OpenAI from 'openai';
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

export const AI_LIMITS = {
  free: 0,
  pro: 50,
  business: 200,
  agency: -1, // unlimited
} as const;

interface QRCodeBasic {
  id: string;
  name: string;
  data: string;
  redirectUrl: string;
  type: string;
  scanCount: number;
  isActive: boolean;
}

interface Analytics {
  totalScans: number;
  uniqueScans: number;
  deviceBreakdown: Array<{ type: string | null; count: number }>;
  browserBreakdown: Array<{ browser: string | null; count: number }>;
  locations: unknown[];
  scansByDay: Array<{ date: Date; count: number }>;
}

interface AnalyticsData {
  qrCode: {
    id: string;
    name: string;
    url: string;
    type: string;
    scans: number;
    isActive: boolean;
  };
  analytics: {
    totalScans: number;
    uniqueScans: number;
    returnRate: number;
    avgDailyScans: number;
    deviceBreakdown: Array<{ type: string; count: number }>;
    browserBreakdown: Array<{ browser: string; count: number }>;
    locations: unknown[];
    mobilePercentage: number;
    hasRecentActivity: boolean;
  };
  issues: string[];
}

interface AIOptimizationResponse {
  improvements: Array<{
    issue: string;
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }>;
  estimatedIncrease?: string;
  priority?: string[];
  nextSteps?: string[];
  beforeScore?: number;
  afterScore?: number;
}

export interface OptimizationSuggestion {
  issue: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  icon: string;
  description: string;
}

export interface OptimizationResult {
  improvements: OptimizationSuggestion[];
  estimatedIncrease: string;
  priority: string[];
  nextSteps: string[];
  beforeScore: number;
  afterScore: number;
}

/**
 * Analyze QR code performance and gather data for optimization
 */
export async function analyzeQRPerformance(qrCodeId: string) {
  try {
    // Get QR code details
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: {
        User: {
          select: {
            Subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    // Get analytics data
    const analytics = await getQRAnalytics(qrCodeId);

    // Calculate performance metrics
    const avgDailyScans = analytics.scansByDay.length > 0
      ? analytics.totalScans / analytics.scansByDay.length
      : 0;

    const returnRate = analytics.uniqueScans > 0
      ? ((analytics.totalScans - analytics.uniqueScans) / analytics.totalScans) * 100
      : 0;

    // Analyze device breakdown
    const mobileScans = analytics.deviceBreakdown
      .filter((d) => d.type === 'mobile' || d.type === 'tablet')
      .reduce((sum, d) => sum + d.count, 0);
    
    const mobilePercentage = analytics.totalScans > 0
      ? (mobileScans / analytics.totalScans) * 100
      : 0;

    // Analyze time patterns
    const hasRecentActivity = analytics.scansByDay.length > 0 &&
      new Date(analytics.scansByDay[analytics.scansByDay.length - 1].date).getTime() > 
      Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days

    return {
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        url: qrCode.redirectUrl,
        type: qrCode.type,
        scans: qrCode.scanCount,
        isActive: qrCode.isActive,
      },
      analytics: {
        totalScans: analytics.totalScans,
        uniqueScans: analytics.uniqueScans,
        returnRate: Math.round(returnRate),
        avgDailyScans: Math.round(avgDailyScans),
        deviceBreakdown: analytics.deviceBreakdown.map(d => ({
          type: d.type || 'unknown',
          count: d.count
        })),
        browserBreakdown: analytics.browserBreakdown.map(b => ({
          browser: b.browser || 'unknown',
          count: b.count
        })),
        locations: analytics.locations || [],
        mobilePercentage: Math.round(mobilePercentage),
        hasRecentActivity,
      },
      issues: detectIssues(qrCode, analytics, mobilePercentage),
    };
  } catch (error) {
    console.error('Error analyzing QR performance:', error);
    throw error;
  }
}

/**
 * Detect common issues with QR codes
 */
function detectIssues(qrCode: QRCodeBasic, analytics: Analytics, mobilePercentage: number) {
  const issues: string[] = [];

  // URL length issue
  if (qrCode.redirectUrl.length > 60) {
    issues.push('long_url');
  }

  // Low scan count
  if (qrCode.scanCount < 10) {
    issues.push('low_scans');
  }

  // Poor mobile optimization
  if (mobilePercentage > 70 && !qrCode.redirectUrl.includes('mobile')) {
    issues.push('mobile_unfriendly');
  }

  // Low return rate
  const returnRate = analytics.uniqueScans > 0
    ? ((analytics.totalScans - analytics.uniqueScans) / analytics.totalScans) * 100
    : 0;
  
  if (returnRate < 10 && analytics.totalScans > 20) {
    issues.push('low_retention');
  }

  // Inactive
  if (!qrCode.isActive) {
    issues.push('inactive');
  }

  return issues;
}

/**
 * Generate AI-powered optimization suggestions
 */
export async function generateOptimizations(
  analyticsData: AnalyticsData,
  userGoal: string
): Promise<OptimizationResult> {
  try {
    const prompt = `You are an expert QR code optimization consultant. Analyze this data and provide specific, actionable improvements.

QR Code Data:
- Name: ${analyticsData.qrCode.name}
- Type: ${analyticsData.qrCode.type}
- Current URL: ${analyticsData.qrCode.url}
- Total Scans: ${analyticsData.analytics.totalScans}
- Unique Scans: ${analyticsData.analytics.uniqueScans}
- Return Rate: ${analyticsData.analytics.returnRate}%
- Average Daily Scans: ${analyticsData.analytics.avgDailyScans}
- Mobile Users: ${analyticsData.analytics.mobilePercentage}%
- Recent Activity: ${analyticsData.analytics.hasRecentActivity ? 'Yes' : 'No'}
- Device Breakdown: ${JSON.stringify(analyticsData.analytics.deviceBreakdown)}
- Detected Issues: ${analyticsData.issues.join(', ')}

User Goal: ${userGoal}

Provide a JSON response with:
{
  "improvements": [
    {
      "issue": "Brief issue description",
      "suggestion": "Specific actionable solution",
      "impact": "low|medium|high",
      "description": "Detailed explanation of why this helps"
    }
  ],
  "estimatedIncrease": "X-Y%",
  "priority": ["Most important improvement", "Second priority", "Third priority"],
  "nextSteps": ["Immediate action 1", "Immediate action 2", "Immediate action 3"],
  "beforeScore": 0-100,
  "afterScore": 0-100
}

Requirements:
- Provide 3-5 specific, implementable improvements
- Focus on the user's stated goal
- Consider the QR code type and current performance
- Estimate realistic impact percentages
- Prioritize high-impact changes
- Include actionable next steps
- Assign performance scores (0-100) before and after
- Be encouraging but realistic`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a QR code optimization expert. Provide specific, actionable, and realistic advice in JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);

    // Add icons to improvements
    const formattedResult = formatSuggestions(result);

    // Track token usage
    await trackAIUsage(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      response.usage?.total_tokens || 0
    );

    return formattedResult;
  } catch (error) {
    console.error('Error generating optimizations:', error);
    throw new Error('Failed to generate optimization suggestions');
  }
}

/**
 * Format AI suggestions with icons and better structure
 */
export function formatSuggestions(aiResponse: AIOptimizationResponse): OptimizationResult {
  const iconMap: Record<string, string> = {
    url: '🔗',
    link: '🔗',
    mobile: '📱',
    design: '🎨',
    landing: '🌐',
    page: '📄',
    redirect: '↗️',
    speed: '⚡',
    performance: '📊',
    tracking: '📈',
    analytics: '📊',
    location: '📍',
    time: '⏰',
    schedule: '📅',
    content: '📝',
    image: '🖼️',
    video: '🎥',
    social: '💬',
    call: '📞',
    email: '📧',
    default: '💡',
  };

  const getIcon = (text: string): string => {
    const lowerText = text.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerText.includes(key)) {
        return icon;
      }
    }
    return iconMap.default;
  };

  return {
    improvements: aiResponse.improvements.map((imp) => ({
      ...imp,
      icon: getIcon(imp.issue + ' ' + imp.suggestion),
    })),
    estimatedIncrease: aiResponse.estimatedIncrease || '20-30%',
    priority: aiResponse.priority || [],
    nextSteps: aiResponse.nextSteps || [],
    beforeScore: aiResponse.beforeScore || 50,
    afterScore: aiResponse.afterScore || 75,
  };
}

/**
 * Check user's remaining AI optimization credits
 */
export async function checkAICredits(userId: string) {
  try {
    // Get user's subscription plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Subscription: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = user.Subscription?.plan?.toLowerCase() || 'free';
    const limit = AI_LIMITS[plan as keyof typeof AI_LIMITS] || AI_LIMITS.free;

    // Count this month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usageCount = await prisma.aIUsage.count({
      where: {
        userId,
        feature: 'qr_optimization',
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const remaining = limit === -1 ? -1 : Math.max(0, limit - usageCount);

    return {
      plan,
      limit,
      used: usageCount,
      remaining,
      hasCredits: limit === -1 || remaining > 0,
    };
  } catch (error) {
    console.error('Error checking AI credits:', error);
    throw error;
  }
}

/**
 * Track AI optimization usage
 */
export async function trackOptimizationUsage(userId: string, _qrCodeId: string) {
  try {
    await prisma.aIUsage.create({
      data: {
        id: `ai_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        feature: 'qr_optimization',
        prompt: 'QR code optimization',
        response: 'Optimization completed',
        tokensUsed: 0,
        cost: 0,
        model: 'gpt-4-turbo-preview',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    });
  } catch (error) {
    console.error('Error tracking optimization usage:', error);
    // Don't throw - tracking failures shouldn't break the feature
  }
}

/**
 * Track AI token usage and cost
 */
async function trackAIUsage(
  promptTokens: number,
  completionTokens: number,
  totalTokens: number
) {
  // GPT-4 Turbo pricing (approximate)
  const promptCost = (promptTokens / 1000) * 0.01;
  const completionCost = (completionTokens / 1000) * 0.03;
  const totalCost = promptCost + completionCost;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    cost: Number(totalCost.toFixed(4)),
  };
}

/**
 * Get usage statistics for analytics
 */
export async function getAIUsageStats(userId: string, startDate?: Date) {
  try {
    const where: {
      userId: string;
      feature: string;
      createdAt?: { gte: Date };
    } = { userId, feature: 'qr_optimization' };
    if (startDate) {
      where.createdAt = { gte: startDate };
    }

    const stats = await prisma.aIUsage.aggregate({
      where,
      _count: true,
      _sum: {
        totalTokens: true,
        cost: true,
      },
    });

    return {
      count: stats._count,
      totalTokens: stats._sum.totalTokens || 0,
      totalCost: stats._sum.cost || 0,
    };
  } catch (error) {
    console.error('Error getting AI usage stats:', error);
    return { count: 0, totalTokens: 0, totalCost: 0 };
  }
}
