import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  analyzeQRPerformance,
  generateOptimizations,
  checkAICredits,
  trackOptimizationUsage,
} from '@/lib/ai/qr-optimizer';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { qrCodeId, userGoal } = await req.json();

    if (!qrCodeId || !userGoal) {
      return NextResponse.json(
        { error: 'Missing required fields: qrCodeId, userGoal' },
        { status: 400 }
      );
    }

    // Verify ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'QR code not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check AI credits
    const credits = await checkAICredits(session.user.id);

    if (!credits.hasCredits) {
      return NextResponse.json(
        {
          error: 'No AI optimization credits remaining',
          plan: credits.plan,
          limit: credits.limit,
          used: credits.used,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Analyze QR code performance
    const analyticsData = await analyzeQRPerformance(qrCodeId);

    // Check if QR has enough data for meaningful analysis
    if (analyticsData.analytics.totalScans === 0) {
      return NextResponse.json(
        {
          error: 'Insufficient data',
          message: 'This QR code needs at least a few scans before AI can provide meaningful optimization suggestions.',
          suggestions: [
            {
              issue: 'No scan data yet',
              suggestion: 'Share your QR code to gather initial performance data',
              impact: 'high',
              icon: '📊',
              description: 'AI optimization works best with real usage data. Try sharing your QR code in different contexts and come back after it has some scans.',
            },
          ],
        },
        { status: 200 }
      );
    }

    // Generate AI optimizations
    const optimizations = await generateOptimizations(analyticsData, userGoal);

    // Track usage (increment counter)
    await trackOptimizationUsage(session.user.id, qrCodeId);

    // Get updated credits
    const updatedCredits = await checkAICredits(session.user.id);

    return NextResponse.json({
      success: true,
      optimizations,
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        scans: qrCode.scanCount,
      },
      credits: {
        remaining: updatedCredits.remaining,
        limit: updatedCredits.limit,
        plan: updatedCredits.plan,
      },
    });
  } catch (error) {
    console.error('AI optimization error:', error);
    
    // Check if it's an OpenAI API error
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is temporarily busy. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate optimization suggestions. Please try again.' },
      { status: 500 }
    );
  }
}

// Get AI credits for current user
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const credits = await checkAICredits(session.user.id);

    return NextResponse.json({
      plan: credits.plan,
      limit: credits.limit,
      used: credits.used,
      remaining: credits.remaining,
      hasCredits: credits.hasCredits,
    });
  } catch (error) {
    console.error('Error fetching AI credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI credits' },
      { status: 500 }
    );
  }
}

