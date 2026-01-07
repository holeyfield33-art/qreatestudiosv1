import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackScan } from '@/lib/services/analytics-service';
import { getBaseUrl } from '@/lib/utils/urls';
import { scanUrl } from '@/lib/services/anti-quishing-service';
import { getSmartRedirect } from '@/lib/services/ai-optimization-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  // Look up QR code
  const qrCode = await prisma.qRCode.findUnique({
    where: { shortCode },
  });

  if (!qrCode) {
    return new Response('QR Code not found', { status: 404 });
  }

  // Validate QR code status
  if (qrCode.isBanned) {
    return new Response('QR Code has been disabled', { status: 403 });
  }

  if (!qrCode.isActive || qrCode.status !== 'active') {
    return new Response('QR Code is not active', { status: 410 });
  }

  if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
    return new Response('QR Code has expired', { status: 410 });
  }

  if (qrCode.maxScans && qrCode.scanCount >= qrCode.maxScans) {
    return new Response('QR Code scan limit reached', { status: 429 });
  }

  // Get scan metadata
  const userAgent = req.headers.get('user-agent') || '';
  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const referrer = req.headers.get('referer') || '';

  // Track scan asynchronously (don't block redirect)
  trackScan(qrCode.id, {
    ipAddress,
    userAgent,
    referrer,
  }).catch((err) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Scan tracking failed:', err);
    }
  });

  // Perform security scan on redirect URL
  const securityScan = await scanUrl(qrCode.redirectUrl);
  
  // If high risk or phishing indicators found, show warning page
  if (!securityScan.safe || securityScan.risk === 'high') {
    const warningUrl = `${getBaseUrl()}/security/warning?url=${encodeURIComponent(
      qrCode.redirectUrl
    )}&code=${shortCode}`;
    return Response.redirect(warningUrl, 307);
  }

  // Special handling for payment QR codes
  if (qrCode.paymentProvider) {
    // For payment QR codes, always use the redirectUrl which contains the payment link
    // Don't use smart redirect for payment links
    return Response.redirect(qrCode.redirectUrl, 307);
  }

  // Use AI-powered smart redirect based on device/browser/location for non-payment QRs
  let redirectUrl = qrCode.redirectUrl;
  try {
    redirectUrl = await getSmartRedirect(qrCode.id, userAgent);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Smart redirect failed, using default:', error);
    }
  }

  // Redirect to destination
  return Response.redirect(redirectUrl, 307);
}
