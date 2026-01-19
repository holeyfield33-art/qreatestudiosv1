import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
    });
  }
  return openai;
}

export interface QRCodeMetadata {
  appStoreUrl?: string;
  playStoreUrl?: string;
  websiteUrl?: string;
  locationRedirects?: Record<string, string>;
}

export interface QRCodeOptimizationData {
  type?: string;
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logo?: string;
  logoSize?: number;
  redirectUrl?: string;
  hasCustomDesign?: boolean;
  placement?: 'high-traffic' | 'medium-traffic' | 'low-traffic';
}

export interface HistoricalScanData {
  date: string;
  scans: number;
}

export interface OptimizationImprovements {
  suggestedColors: { foreground: string; background: string } | null;
  suggestedSize: number | null;
  suggestedErrorCorrection: 'M' | 'H' | null;
  suggestedLogoSize: number | null;
}

// Smart redirect based on device, browser, and location
export async function getSmartRedirect(
  qrCodeId: string,
  userAgent: string,
  location?: string
): Promise<string> {
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: qrCodeId },
  });

  if (!qrCode) throw new Error('QR code not found');

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const isIOS = /iphone|ipad/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);

  // Smart redirect for app download links
  // Note: metadata field would need to be added to schema for this to work
  const style = qrCode.style as unknown;
  const metadata = (style && typeof style === 'object' && 'metadata' in style
    ? (style as { metadata?: QRCodeMetadata }).metadata
    : null) || null;
  
  if (qrCode.type === 'APP_DOWNLOAD' && metadata) {
    if (isMobile) {
      if (isIOS && metadata.appStoreUrl) {
        return metadata.appStoreUrl;
      }
      if (isAndroid && metadata.playStoreUrl) {
        return metadata.playStoreUrl;
      }
    }
    
    // Fallback to website for desktop
    return metadata.websiteUrl || qrCode.redirectUrl;
  }

  // Location-based redirects
  if (location && metadata) {
    const locationRedirects = metadata.locationRedirects;
    
    if (locationRedirects && typeof locationRedirects === 'object') {
      for (const [region, url] of Object.entries(locationRedirects)) {
        if (location.toLowerCase().includes(region.toLowerCase())) {
          return url as string;
        }
      }
    }
  }

  return qrCode.redirectUrl;
}

// Detect language of text using AI
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Detect the language of the following text. Respond with just the ISO 639-1 language code (e.g., en, es, fr, de, zh, ja, pt, it, ru, ar).',
        },
        {
          role: 'user',
          content: text.substring(0, 500), // Limit text length
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    return response.choices[0].message.content?.trim().toLowerCase() || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

// Translate content to target language
export async function translateContent(
  content: string,
  targetLanguage: string
): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following content to ${targetLanguage}. Maintain the original formatting, tone, and structure. Only return the translated text, no explanations.`,
        },
        {
          role: 'user',
          content,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    return response.choices[0].message.content || content;
  } catch (error) {
    console.error('Translation error:', error);
    return content;
  }
}

// Optimize QR code design and provide recommendations
export async function optimizeQRDesign(qrCodeData: QRCodeOptimizationData): Promise<{
  recommendations: string[];
  score: number;
  improvements: OptimizationImprovements;
}> {
  const recommendations: string[] = [];
  let score = 100;

  const fgColor = qrCodeData.foregroundColor || '#000000';
  const bgColor = qrCodeData.backgroundColor || '#FFFFFF';
  
  // Check color contrast
  if (!hasGoodContrast(fgColor, bgColor)) {
    recommendations.push('⚠️ Poor color contrast detected. Use darker foreground with lighter background for better scanning reliability.');
    score -= 15;
  }

  // Check QR code size
  if (!qrCodeData.size || qrCodeData.size < 200) {
    recommendations.push('📏 QR code size is too small. Increase to at least 200x200px for optimal scanning distance.');
    score -= 10;
  }

  // Check error correction level
  if (qrCodeData.errorCorrectionLevel === 'L') {
    recommendations.push('🛡️ Low error correction level detected. Use Medium (M) or High (H) for better scan reliability, especially with logos.');
    score -= 10;
  }

  // Check if logo exists and is appropriate size
  if (qrCodeData.logo && qrCodeData.logoSize && qrCodeData.logoSize > 30) {
    recommendations.push('🖼️ Logo is too large. Keep logo size under 30% of QR code to maintain scannability.');
    score -= 12;
  }

  // Check redirect URL length
  if (qrCodeData.redirectUrl && qrCodeData.redirectUrl.length > 100) {
    recommendations.push('🔗 Long URL detected. Consider using a URL shortener to reduce QR code complexity.');
    score -= 8;
  }

  // Get AI-powered recommendations
  try {
    const aiResponse = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a QR code optimization expert. Analyze the QR code configuration and provide 2-3 specific, actionable recommendations to improve scan rates and user engagement. Be concise and use emojis.',
        },
        {
          role: 'user',
          content: `QR Code Config: ${JSON.stringify({
            type: qrCodeData.type,
            size: qrCodeData.size,
            hasLogo: !!qrCodeData.logo,
            errorCorrection: qrCodeData.errorCorrectionLevel,
            colors: { fg: fgColor, bg: bgColor },
            urlLength: qrCodeData.redirectUrl?.length || 0,
          })}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiSuggestions = aiResponse.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3) || [];
    
    recommendations.push(...aiSuggestions);
  } catch (error) {
    console.error('AI optimization error:', error);
  }

  return {
    recommendations: recommendations.slice(0, 8), // Max 8 recommendations
    score: Math.max(score, 0),
    improvements: {
      suggestedColors: score < 85 ? {
        foreground: '#000000',
        background: '#FFFFFF'
      } : null,
      suggestedSize: qrCodeData.size && qrCodeData.size < 200 ? 300 : null,
      suggestedErrorCorrection: qrCodeData.errorCorrectionLevel === 'L' ? 'H' : null,
      suggestedLogoSize: qrCodeData.logoSize && qrCodeData.logoSize > 30 ? 25 : null,
    },
  };
}

// Check color contrast
function hasGoodContrast(fgColor: string, bgColor: string): boolean {
  const fg = parseInt(fgColor.replace('#', ''), 16);
  const bg = parseInt(bgColor.replace('#', ''), 16);
  const diff = Math.abs(fg - bg);
  return diff > 0x888888; // Require significant difference
}

// Check link health and detect broken links
export async function checkLinkHealth(url: string): Promise<{
  isHealthy: boolean;
  statusCode?: number;
  error?: string;
  suggestions?: string[];
  alternativeUrl?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const isHealthy = response.status >= 200 && response.status < 400;

    if (!isHealthy) {
      // Try to suggest fix
      const suggestions = getSuggestions(response.status, url);
      return {
        isHealthy: false,
        statusCode: response.status,
        suggestions,
      };
    }

    return {
      isHealthy: true,
      statusCode: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const suggestions = [
      '🔍 URL appears to be unreachable',
      '✏️ Check for typos in the URL',
      '🌐 Verify the website is online',
      '🔄 Consider updating to a working URL',
    ];

    // Try to suggest alternative
    let alternativeUrl: string | undefined;
    if (url.startsWith('http://')) {
      alternativeUrl = url.replace('http://', 'https://');
      suggestions.unshift('🔒 Try using HTTPS instead of HTTP');
    }

    return {
      isHealthy: false,
      error: errorMessage,
      suggestions,
      alternativeUrl,
    };
  }
}

function getSuggestions(statusCode: number, url: string): string[] {
  const suggestions: string[] = [];

  if (statusCode === 404) {
    suggestions.push('❌ Page not found (404)');
    suggestions.push('📝 Check if the URL path is correct');
    suggestions.push('🔍 Verify the page still exists on the website');
  } else if (statusCode === 403) {
    suggestions.push('🚫 Access forbidden (403)');
    suggestions.push('🔐 This page may require authentication');
    suggestions.push('⚙️ Check server permissions');
  } else if (statusCode === 500) {
    suggestions.push('⚠️ Server error (500)');
    suggestions.push('🔄 The website may be experiencing issues');
    suggestions.push('⏱️ Try again later or contact the website owner');
  } else if (statusCode >= 300 && statusCode < 400) {
    suggestions.push('🔄 Redirect detected');
    suggestions.push('✅ URL is redirecting (this is usually fine)');
  } else {
    suggestions.push(`⚠️ HTTP ${statusCode} response`);
    suggestions.push('🌐 Website may be down or misconfigured');
  }

  return suggestions;
}

// Generate SEO optimizations for landing pages
export async function generateSEOOptimizations(
  landingPageContent: string,
  title?: string
): Promise<{
  title: string;
  description: string;
  keywords: string[];
  suggestions: string[];
  score: number;
}> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Analyze the landing page content and provide optimized SEO elements. Respond ONLY with valid JSON containing: title (string, max 60 chars), description (string, max 160 chars), keywords (array of strings, max 10), suggestions (array of strings, max 5), score (number 0-100).',
        },
        {
          role: 'user',
          content: `Current title: ${title || 'None'}\n\nContent:\n${landingPageContent.substring(0, 1500)}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const result = response.choices[0].message.content || '{}';
    const cleaned = result.replace(/```json|```/g, '').trim();
    const seoData = JSON.parse(cleaned);

    return {
      title: seoData.title || title || 'Untitled Page',
      description: seoData.description || '',
      keywords: (seoData.keywords || []).slice(0, 10),
      suggestions: (seoData.suggestions || []).slice(0, 5),
      score: seoData.score || 50,
    };
  } catch (error) {
    console.error('SEO optimization error:', error);
    return {
      title: title || 'Untitled Page',
      description: '',
      keywords: [],
      suggestions: [
        '📝 Add a compelling title (50-60 characters)',
        '📄 Write a meta description (150-160 characters)',
        '🔑 Include relevant keywords throughout content',
        '🖼️ Add alt text to images',
        '🔗 Include internal and external links',
      ],
      score: 30,
    };
  }
}

// Predict scan rate based on QR code characteristics
export async function predictScanRate(
  qrCodeData: QRCodeOptimizationData,
  historicalData?: HistoricalScanData[]
): Promise<{
  predictedScansPerDay: number;
  confidence: number;
  factors: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
}> {
  let predictedScans = 10; // Base prediction
  const factors: string[] = [];
  let confidence = 60;

  // Factor 1: Placement/Location
  if (qrCodeData.placement) {
    if (qrCodeData.placement === 'high-traffic') {
      predictedScans *= 5;
      factors.push('📍 High-traffic location (+400%)');
    } else if (qrCodeData.placement === 'medium-traffic') {
      predictedScans *= 2.5;
      factors.push('📍 Medium-traffic location (+150%)');
    }
  }

  // Factor 2: Custom design
  if (qrCodeData.hasCustomDesign || qrCodeData.logo) {
    predictedScans *= 1.5;
    factors.push('🎨 Custom design increases engagement (+50%)');
  }

  // Factor 3: QR code size
  if (qrCodeData.size) {
    if (qrCodeData.size >= 300) {
      predictedScans *= 1.3;
      factors.push('📏 Optimal size for scanning (+30%)');
    } else if (qrCodeData.size < 200) {
      predictedScans *= 0.8;
      factors.push('⚠️ Small size may reduce scans (-20%)');
    }
  }

  // Factor 4: Type of content
  if (qrCodeData.type === 'LANDING_PAGE' || qrCodeData.type === 'MENU') {
    predictedScans *= 1.4;
    factors.push('📱 Engaging content type (+40%)');
  }

  // Factor 5: Historical data analysis
  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  
  if (historicalData && historicalData.length > 7) {
    const recentWeek = historicalData.slice(-7);
    const previousWeek = historicalData.slice(-14, -7);
    
    const recentAvg = recentWeek.reduce((sum, day) => sum + day.scans, 0) / recentWeek.length;
    const previousAvg = previousWeek.length > 0 
      ? previousWeek.reduce((sum, day) => sum + day.scans, 0) / previousWeek.length 
      : recentAvg;
    
    const change = (recentAvg - previousAvg) / previousAvg;
    
    if (change > 0.1) {
      trend = 'increasing';
      predictedScans = recentAvg * 1.15;
      factors.push('📈 Growing trend (+15%)');
    } else if (change < -0.1) {
      trend = 'decreasing';
      predictedScans = recentAvg * 0.9;
      factors.push('📉 Declining trend (-10%)');
    } else {
      trend = 'stable';
      predictedScans = recentAvg;
      factors.push('➡️ Stable performance');
    }
    
    confidence = 85; // Higher confidence with historical data
  }

  return {
    predictedScansPerDay: Math.round(predictedScans),
    confidence,
    factors,
    trend,
  };
}

// Personalization recommendations
export async function getPersonalizationRecommendations(
  qrCodeId: string,
  userId: string
): Promise<{
  isReturningUser: boolean;
  recommendations: string[];
  customContent?: Record<string, unknown>;
}> {
  // Check if user has scanned this QR code before
  const previousScans = await prisma.analytics.findMany({
    where: {
      qrCodeId,
      // Note: We'd need to track user IDs in analytics to fully implement this
    },
    orderBy: { scannedAt: 'desc' },
    take: 5,
  });

  const isReturningUser = previousScans.length > 0;
  const recommendations: string[] = [];

  if (isReturningUser) {
    recommendations.push('👋 Welcome back! Show personalized content for returning users');
    recommendations.push('🎁 Consider offering loyalty rewards or exclusive content');
    recommendations.push('📊 Display progress or history since last visit');
  } else {
    recommendations.push('✨ First-time visitor! Show onboarding or welcome message');
    recommendations.push('🎯 Highlight key features and benefits');
    recommendations.push('📱 Encourage app download or account creation');
  }

  return {
    isReturningUser,
    recommendations,
  };
}

// A/B testing recommendations
export async function generateABTestSuggestions(
  qrCodeData: QRCodeOptimizationData
): Promise<{
  testIdeas: Array<{
    name: string;
    description: string;
    variants: string[];
    expectedImpact: string;
  }>;
}> {
  const testIdeas = [
    {
      name: 'Color Scheme Test',
      description: 'Test different color combinations to find the most scannable design',
      variants: ['High contrast (Black/White)', 'Brand colors', 'Gradient design'],
      expectedImpact: 'Potential 15-25% increase in scan rate',
    },
    {
      name: 'Call-to-Action Test',
      description: 'Test different landing page headlines and CTAs',
      variants: ['Direct approach', 'Question-based', 'Benefit-focused'],
      expectedImpact: 'Potential 20-30% increase in conversions',
    },
    {
      name: 'Size and Placement Test',
      description: 'Test different QR code sizes and placements',
      variants: ['Large and centered', 'Medium with context', 'Small with instructions'],
      expectedImpact: 'Potential 10-20% increase in scan rate',
    },
  ];

  if (qrCodeData.type === 'LANDING_PAGE') {
    testIdeas.push({
      name: 'Content Layout Test',
      description: 'Test different landing page layouts',
      variants: ['Image-first', 'Text-first', 'Video-first'],
      expectedImpact: 'Potential 25-35% increase in engagement',
    });
  }

  return { testIdeas };
}

// Auto-healing: Generate alternative URLs
export async function generateAlternativeUrls(brokenUrl: string): Promise<string[]> {
  const alternatives: string[] = [];

  // Try HTTPS if HTTP
  if (brokenUrl.startsWith('http://')) {
    alternatives.push(brokenUrl.replace('http://', 'https://'));
  }

  // Try without www
  if (brokenUrl.includes('://www.')) {
    alternatives.push(brokenUrl.replace('://www.', '://'));
  }

  // Try with www
  if (!brokenUrl.includes('://www.')) {
    alternatives.push(brokenUrl.replace('://', '://www.'));
  }

  // Try removing trailing slash
  if (brokenUrl.endsWith('/')) {
    alternatives.push(brokenUrl.slice(0, -1));
  }

  return alternatives.filter((url, index, self) => 
    self.indexOf(url) === index && url !== brokenUrl
  );
}
