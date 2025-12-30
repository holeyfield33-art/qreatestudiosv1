import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { optimizeQRDesign } from '@/lib/services/ai-optimization-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: 'QR code data required' }, { status: 400 });
    }

    const optimization = await optimizeQRDesign(body);
    
    return NextResponse.json({
      success: true,
      ...optimization,
    });
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize QR code' },
      { status: 500 }
    );
  }
}
