import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }
  return resend;
}

export interface PrintOrder {
  id: string;
  orderNumber: string;
  productType: string;
  quantity: number;
  totalPrice: number;
  status: string;
  customerEmail?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
}

export interface QRCodeData {
  name: string;
  shortCode: string;
}

export interface CustomerData {
  name?: string;
  email: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'orders@qreatestudios.com',
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function sendPrintOrderAdminEmail(order: PrintOrder, qrCode: QRCodeData, _customer: CustomerData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none; }
          .order-detail { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
          .address-box { background: #f3f4f6; padding: 15px; border: 2px solid #e5e7eb; margin: 15px 0; border-radius: 6px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🖨️ New Print Order</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Order Details</h2>
            <div class="order-detail"><strong>Product:</strong> ${order.productType}</div>
            <div class="order-detail"><strong>Quantity:</strong> ${order.quantity}</div>
            <div class="order-detail"><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</div>
            <div class="order-detail"><strong>Status:</strong> ${order.status}</div>
            
            <h2 style="color: #1f2937;">Shipping Address</h2>
            <div class="address-box">
              <strong>${order.shippingAddress.name}</strong><br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
              Phone: ${order.shippingAddress.phone}
            </div>
            
            <h2 style="color: #1f2937;">QR Code</h2>
            <div class="order-detail"><strong>Name:</strong> ${qrCode.name}</div>
            <div class="order-detail"><strong>Short URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/${qrCode.shortCode}</div>
            
            <p style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/print-orders" class="button">
                View in Admin Panel
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(
    process.env.ADMIN_EMAIL || 'admin@qreatestudios.com',
    `🖨️ New Print Order #${order.orderNumber}`,
    html
  );
}

export async function sendPrintOrderCustomerEmail(order: PrintOrder, customer: CustomerData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none; }
          .summary { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
          </div>
          <div class="content">
            <p>Hi ${customer.name || 'there'},</p>
            <p>Thank you for your order! We've received your print order and will begin processing it shortly.</p>
            
            <h3 style="color: #1f2937;">Order Summary</h3>
            <div class="summary">
              <strong>Product:</strong> ${order.productType}<br>
              <strong>Quantity:</strong> ${order.quantity}<br>
              <strong>Total:</strong> $${order.totalPrice.toFixed(2)}
            </div>
            
            <h3 style="color: #1f2937;">What's Next?</h3>
            <p>
              📦 Your order will be printed and shipped within 3-5 business days.<br>
              📧 You'll receive an email with tracking information when your order ships.<br>
              👀 You can track your order status anytime in your dashboard.
            </p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/print/orders/${order.id}" class="button">
                View Order Status
              </a>
            </p>
            
            <p style="margin-top: 30px; color: #6b7280;">
              If you have any questions, reply to this email or contact us at ${process.env.SUPPORT_EMAIL || 'support@qreatestudios.com'}
            </p>
            
            <p>Thanks,<br>The Qreate Studios Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(
    order.customerEmail || customer.email,
    `Order Confirmation #${order.orderNumber} - Qreate Studios`,
    html
  );
}

export async function sendOrderShippedEmail(order: PrintOrder, trackingNumber: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: white; border: 1px solid #e5e7eb; border-top: none; text-align: center; }
          .tracking { font-size: 24px; font-weight: bold; color: #10b981; background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937;">Tracking Number</h2>
            <div class="tracking">
              ${trackingNumber}
            </div>
            <p style="font-size: 16px;">Your order is on its way! Expected delivery: 3-5 business days</p>
            <p style="margin-top: 30px; color: #6b7280;">
              You can track your shipment using the tracking number above with USPS, UPS, or FedEx.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!order.customerEmail) {
    return { success: false, error: 'No customer email provided' };
  }

  return sendEmail(
    order.customerEmail,
    `Your order #${order.orderNumber} has shipped! 📦`,
    html
  );
}

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: white; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .feature { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Qreate Studios</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Welcome to Qreate Studios! We're excited to have you on board.</p>
            
            <h3 style="color: #1f2937;">Here's what you can do:</h3>
            <div class="feature">
              <strong>Create QR Codes</strong><br>
              Generate dynamic QR codes for any purpose with full analytics
            </div>
            <div class="feature">
              <strong>Use AI Tools</strong><br>
              Generate content with GPT-4o powered tools
            </div>
            <div class="feature">
              <strong>Order Prints</strong><br>
              Get professional prints delivered to your door
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                Go to Dashboard
              </a>
            </p>
            
            <p style="margin-top: 30px; color: #6b7280;">
              Need help? Check out our documentation or contact us at ${process.env.SUPPORT_EMAIL || 'support@qreatestudios.com'}
            </p>
            
            <p>Best regards,<br>The Qreate Studios Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(
    user.email,
    'Welcome to Qreate Studios',
    html
  );
}
