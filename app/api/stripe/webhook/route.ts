export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/services/stripe-service';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Webhook signature verification failed:', error.message);
    }
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        // Check if this is an NFC order
        if (session.metadata?.orderType === 'nfc') {
          await handleNFCOrderPayment(session);
          break;
        }
        
        // Otherwise handle subscription
        const userId = session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          if (process.env.NODE_ENV === 'development') {
              console.error('No userId in checkout session');
    }
          break;
        }

        const stripeSubscription: any = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const plan = getPlanFromPriceId(stripeSubscription.items.data[0].price.id);

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status: 'ACTIVE' as const,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
          create: {
            id: randomUUID(),
            userId,
            plan,
            status: 'ACTIVE' as const,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            updatedAt: new Date(),
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.cancel_at_period_end ? ('CANCELED' as const) : ('ACTIVE' as const),
            currentPeriodStart: new Date((subscription.current_period_start as number) * 1000),
            currentPeriodEnd: new Date((subscription.current_period_end as number) * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED' as const,
            plan: 'FREE',
          },
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: invoice.customer },
          data: {
            status: 'PAST_DUE' as const,
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Webhook handler error:', error);
    }
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO';
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return 'BUSINESS';
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return 'AGENCY';
  return 'FREE';
}

/**
 * Handle NFC order payment completion
 */
async function handleNFCOrderPayment(session: any) {
  try {
    const { orderId, encodeUrl, qrCodeName } = session.metadata;
    
    if (!orderId) {
      console.error('No orderId in NFC order session metadata');
      return;
    }

    // Fetch existing order first
    const existingOrder = await prisma.printOrder.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    // Update order status to paid
    const order = await prisma.printOrder.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        customerPhone: session.customer_details?.phone || null,
        shippingAddress: {
          name: session.customer_details?.name || '',
          line1: session.shipping_details?.address?.line1 || '',
          line2: session.shipping_details?.address?.line2 || '',
          city: session.shipping_details?.address?.city || '',
          state: session.shipping_details?.address?.state || '',
          zip: session.shipping_details?.address?.postal_code || '',
          country: session.shipping_details?.address?.country || 'US',
          phone: session.customer_details?.phone || '',
        },
        specifications: {
          ...(existingOrder.specifications as any),
          stripePaymentIntentId: session.payment_intent,
          paidAt: new Date().toISOString(),
        },
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

    // Send admin fulfillment notification email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const specs = order.specifications as any;
        const items = specs.items || [];
        
        const itemsList = items.map((item: any) => 
          `- ${item.quantity}x ${item.productId}${item.designFileUrl ? ' (Custom Design)' : ''}`
        ).join('\n');

        await resend.emails.send({
          from: 'QR Orders <orders@qreatestudios.com>',
          to: process.env.ADMIN_EMAIL || 'admin@qreatestudios.com',
          subject: `🆕 New NFC Order to Fulfill - ${order.orderNumber}`,
          html: `
            <h2>New NFC Order Received!</h2>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.User?.name || 'Unknown'} (${order.User?.email})</p>
            
            <h3>🔗 ENCODE URL (Copy This):</h3>
            <p style="font-size: 18px; font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              <strong>${encodeUrl}</strong>
            </p>
            
            <h3>📦 Products:</h3>
            <pre>${itemsList}</pre>
            
            <h3>📍 Ship To:</h3>
            <pre>${JSON.stringify(order.shippingAddress, null, 2)}</pre>
            
            <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders">View in Admin Panel</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
    }

    // Send customer confirmation email
    if (order.customerEmail && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'QReate Studios <orders@qreatestudios.com>',
          to: order.customerEmail,
          subject: `Your NFC Order is Confirmed! - ${order.orderNumber}`,
          html: `
            <h2>Thank You for Your Order!</h2>
            <p>Hi ${order.User?.name || 'there'},</p>
            
            <p>Your NFC order has been received and payment confirmed.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>QR Code:</strong> ${qrCodeName}</p>
            <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
            
            <h3>What's Next?</h3>
            <p>✅ We're encoding your NFC products now<br>
            📦 Ships in 2 business days<br>
            📧 You'll receive tracking info when shipped</p>
            
            <p>Questions? Reply to this email or contact us at ${process.env.SUPPORT_EMAIL || 'support@qreatestudios.com'}</p>
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders">Track Your Order</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send customer confirmation:', emailError);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`NFC order ${order.orderNumber} payment processed successfully`);
    }
  } catch (error) {
    console.error('Error handling NFC order payment:', error);
    throw error;
  }
}
