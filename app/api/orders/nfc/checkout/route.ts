export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/services/stripe-service';
import type Stripe from 'stripe';
import {
  type NFCOrderItem,
  calculateOrderTotal,
  getProductById,
} from '@/lib/types/nfc-products';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { qrCodeId, items } = await req.json() as {
      qrCodeId: string;
      items: NFCOrderItem[];
    };

    if (!qrCodeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      select: {
        id: true,
        shortCode: true,
        name: true,
        userId: true,
      },
    });

    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'QR code not found or unauthorized' },
        { status: 404 }
      );
    }

    // Validate all products exist
    const invalidProducts = items.filter(item => !getProductById(item.productId));
    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { error: 'Invalid product IDs' },
        { status: 400 }
      );
    }

    // Check for missing designs on custom products
    const missingDesigns = items.filter(item => {
      const product = getProductById(item.productId);
      return product?.requiresDesign && !item.designFileUrl;
    });

    if (missingDesigns.length > 0) {
      return NextResponse.json(
        { error: 'Missing design files for custom products' },
        { status: 400 }
      );
    }

    // Calculate totals
    const { subtotal: _subtotal, shipping, total } = calculateOrderTotal(items);

    // Generate unique order number
    const orderNumber = `NFC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Construct encode URL
    const encodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${qrCode.shortCode}`;

    // Create order in database
    const order = await prisma.printOrder.create({
      data: {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        qrCodeId,
        orderNumber,
        productType: 'nfc', // Use productType to distinguish NFC vs Print
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        specifications: JSON.parse(JSON.stringify({
          items,
          encodeUrl,
          orderType: 'nfc',
        })),
        shippingAddress: {}, // Will be collected by Stripe Checkout
        totalPrice: total / 100, // Convert cents to dollars
        status: 'pending_payment',
        customerEmail: session.user.email,
        updatedAt: new Date(),
      },
    });

    // Create Stripe Checkout line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => {
      const product = getProductById(item.productId)!;
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: [product.image],
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping',
          },
          unit_amount: shipping,
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email || undefined,
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Expand as needed
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        orderType: 'nfc',
        orderId: order.id,
        orderNumber: order.orderNumber,
        qrCodeId: qrCode.id,
        qrCodeName: qrCode.name,
        encodeUrl,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/qr-codes/${qrCode.id}/order-nfc`,
    });

    // Update order with Stripe session ID
    await prisma.printOrder.update({
      where: { id: order.id },
      data: {
        specifications: {
          ...order.specifications as any,
          stripeSessionId: checkoutSession.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('NFC checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
