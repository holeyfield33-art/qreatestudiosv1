export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }
  return resend;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { trackingNumber } = await req.json();

    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const { orderId } = await params;

    // Update order with tracking number and mark as shipped
    const order = await prisma.printOrder.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        trackingNumber,
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send shipping notification email to customer
    if (order.User?.email) {
      const shippingAddress = order.shippingAddress as any;
      
      await getResend().emails.send({
        from: 'QReate Studios <orders@qreatestudios.com>',
        to: order.User.email,
        subject: `Your NFC Order ${order.orderNumber} Has Shipped! 📦`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Your Order Has Shipped! 🚚</h1>
            
            <p>Hi ${shippingAddress.name},</p>
            
            <p>Great news! Your NFC order <strong>${order.orderNumber}</strong> has been shipped and is on its way to you.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Tracking Information</h3>
              <p style="font-size: 18px; font-weight: bold; color: #2563eb;">
                ${trackingNumber}
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                You can track your package using this number with your carrier.
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px;">
                <strong>📍 Shipping To:</strong><br/>
                ${shippingAddress.line1}<br/>
                ${shippingAddress.line2 ? shippingAddress.line2 + '<br/>' : ''}
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br/>
                ${shippingAddress.country}
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Estimated delivery: 3-5 business days from shipment date.
            </p>
            
            <p>If you have any questions about your order, please don't hesitate to reach out to our support team.</p>
            
            <p>Thank you for choosing QReate Studios!</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #9ca3af;">
              Order #${order.orderNumber}<br/>
              QReate Studios<br/>
              <a href="https://qreatestudios.com" style="color: #2563eb;">qreatestudios.com</a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error marking order as shipped:', error);
    return NextResponse.json(
      { error: 'Failed to mark order as shipped' },
      { status: 500 }
    );
  }
}
