import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyQRPassword } from '@/lib/utils/qr-password';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shortCode, password } = body;

    if (!shortCode || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find QR code by shortCode
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      select: {
        id: true,
        isSecure: true,
        password: true,
        redirectUrl: true,
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    if (!qrCode.isSecure || !qrCode.password) {
      return NextResponse.json(
        { error: 'QR code is not password protected' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await verifyQRPassword(password, qrCode.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password', success: false },
        { status: 401 }
      );
    }

    // Password is valid - return a temporary token
    // In a production system, you'd want to use a JWT or session token
    // For now, we'll return success and let the client redirect
    return NextResponse.json({
      success: true,
      redirectUrl: qrCode.redirectUrl,
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
