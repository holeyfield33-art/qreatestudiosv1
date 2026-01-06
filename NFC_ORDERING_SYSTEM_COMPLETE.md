# NFC Product Ordering System - Complete Implementation

## Overview
Complete e-commerce system for selling physical NFC cards and stickers pre-encoded with user's QR codes. Integrates with Stripe for payments, includes admin fulfillment panel, and automates customer notifications.

## Features Implemented

### 1. Product Catalog
- **Blank NFC Cards** ($2.99 each)
- **Custom Designed NFC Cards** ($4.99 each) - with custom design upload
- **10-Pack NFC Stickers** ($14.99)
- **50-Pack NFC Stickers** ($59.99)
- Free shipping on orders $15+, otherwise $2.99

### 2. User-Facing Order Flow
**Path:** `/dashboard/qr-codes/[id]/order-nfc`

Features:
- Product selection with images
- Quantity adjustment
- Custom design file upload (for custom cards)
- Shopping cart with subtotal/shipping/total
- Stripe Checkout integration
- Shipping address collection
- Real-time price calculation

CTA Button:
- Added to QR code details page
- Animated gradient effect
- Prominent placement below QR preview

### 3. Admin Fulfillment Panel
**Path:** `/dashboard/orders` (NFC Orders tab)

**Component:** `NFCOrdersPanel.tsx`

Features:
- List all paid NFC orders
- Search by order #, customer name, email
- Filter by status (Paid, Encoding, Encoded, Shipped, Delivered)
- Highlighted encode URL with one-click copy
- Product details with custom design links
- Formatted shipping address with copy function
- Status workflow buttons:
  - Paid → Mark as Encoding
  - Encoding → Mark as Encoded
  - Encoded/Encoding → Mark as Shipped (requires tracking #)
- Print packing slip button
- Tracking number display and copy

Status Workflow:
```
Paid → Encoding → Encoded → Shipped → Delivered
```

### 4. API Endpoints

#### Order Creation
**POST** `/api/orders/nfc/checkout`
- Validates QR code ownership
- Creates PrintOrder with productType='nfc'
- Calculates totals (subtotal + shipping)
- Creates Stripe checkout session
- Stores order specifications in JSON

#### Admin Management
**GET** `/api/admin/orders/nfc`
- Lists all NFC orders (admin only)
- Includes user and product details

**PATCH** `/api/admin/orders/[orderId]/status`
- Updates order status
- Admin authentication required

**POST** `/api/admin/orders/[orderId]/ship`
- Marks order as shipped
- Saves tracking number
- Sends customer email notification

### 5. Stripe Integration

#### Webhook Handler
**Updated:** `/app/api/stripe/webhook/route.ts`

Handles `checkout.session.completed` events:
1. Checks metadata.orderType === 'nfc'
2. Updates order status to 'paid'
3. Saves shipping address from Stripe
4. Sends admin fulfillment email
5. Sends customer confirmation email

Admin Email Includes:
- Order number and date
- **Encode URL** (highlighted in large, bold text)
- Product list with quantities
- Shipping address (formatted for easy copying)
- Customer contact info

Customer Email Includes:
- Order confirmation
- Product details
- Shipping address
- 2-day shipping estimate
- Order number for reference

## File Structure

```
/lib/types/nfc-products.ts                    # Product catalog and types
/app/dashboard/qr-codes/[id]/order-nfc/page.tsx  # Product selection page
/app/api/orders/nfc/checkout/route.ts         # Checkout API
/app/api/stripe/webhook/route.ts              # Payment handler (updated)
/components/admin/NFCOrdersPanel.tsx          # Admin fulfillment panel
/app/dashboard/orders/page.tsx                # Orders management page
/app/api/admin/orders/nfc/route.ts            # List orders
/app/api/admin/orders/[orderId]/status/route.ts   # Update status
/app/api/admin/orders/[orderId]/ship/route.ts     # Mark shipped
```

## Database Schema

Uses existing `PrintOrder` model:
```prisma
model PrintOrder {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  userId          String
  qrCodeId        String?
  productType     String   // 'nfc' for NFC orders
  quantity        Int
  totalPrice      Float
  status          String   // 'pending_payment', 'paid', 'encoding', 'encoded', 'shipped', 'delivered'
  specifications  Json     // stores: items[], encodeUrl, customDesigns[]
  shippingAddress Json?    // Stripe shipping details
  trackingNumber  String?
  createdAt       DateTime @default(now())
  User            User     @relation(fields: [userId], references: [id])
}
```

## Order Specifications JSON Structure

```json
{
  "items": [
    {
      "productId": "nfc-blank-card",
      "quantity": 2,
      "price": 2.99,
      "designFileUrl": null
    },
    {
      "productId": "nfc-custom-card",
      "quantity": 1,
      "price": 4.99,
      "designFileUrl": "https://..."
    }
  ],
  "encodeUrl": "https://qreatestudios.com/abc123",
  "subtotal": 10.97,
  "shipping": 0,
  "total": 10.97
}
```

## Shipping Address JSON Structure

```json
{
  "name": "John Doe",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94102",
  "country": "US",
  "phone": "+1 (555) 123-4567"
}
```

## Usage Instructions

### For Customers

1. **Create QR Code** - Generate any QR code type
2. **Navigate to QR Details** - Click on QR code to view details
3. **Click "Get Physical NFC Card/Sticker"** - Animated button below QR preview
4. **Select Products** - Choose from 4 product types
5. **Adjust Quantities** - Use +/- buttons
6. **Upload Custom Design** (optional) - For custom card products
7. **Review Cart** - Check subtotal, shipping, total
8. **Proceed to Checkout** - Stripe Checkout opens
9. **Enter Shipping Info** - Collected by Stripe
10. **Complete Payment** - Credit card or other Stripe methods
11. **Receive Confirmation** - Email with order details and 2-day estimate

### For Admins

1. **Navigate to Orders** - `/dashboard/orders`
2. **Select NFC Orders Tab** - View all NFC orders
3. **Filter/Search** - Find specific orders
4. **Copy Encode URL** - Use for NFC programming
5. **Download Custom Designs** (if any) - Click "View Design" links
6. **Update Status:**
   - Click "Mark as Encoding" when starting
   - Click "Mark as Encoded" when NFC programming done
   - Click "Mark as Shipped" when ready to ship
7. **Enter Tracking Number** - Required for shipped status
8. **Customer Auto-Notified** - Email sent with tracking info
9. **Print Packing Slip** - Use print button

## Testing Checklist

### Order Creation
- [ ] Can select products and adjust quantities
- [ ] Can upload custom design files
- [ ] Cart totals calculate correctly (subtotal + shipping)
- [ ] Free shipping applies at $15+
- [ ] Stripe checkout session creates successfully
- [ ] Redirects to Stripe hosted checkout

### Payment Processing
- [ ] Webhook receives checkout.session.completed
- [ ] Order status updates from 'pending_payment' to 'paid'
- [ ] Shipping address saves to order
- [ ] Admin receives fulfillment email with encode URL
- [ ] Customer receives confirmation email

### Admin Panel
- [ ] Orders list loads for admin users
- [ ] Non-admin users get 403 forbidden
- [ ] Search by order number works
- [ ] Search by customer name/email works
- [ ] Status filter works
- [ ] Encode URL copies to clipboard
- [ ] Shipping address copies formatted
- [ ] Status update buttons work
- [ ] Tracking number dialog opens
- [ ] Shipped notification email sends

### Email Content
- [ ] Admin email has bold/large encode URL
- [ ] Admin email has formatted shipping address
- [ ] Customer confirmation email has order details
- [ ] Shipping notification email has tracking number
- [ ] All emails have correct branding

## Security Considerations

1. **Order Ownership** - Checkout API verifies user owns QR code
2. **Admin Authentication** - All admin endpoints check for ADMIN role
3. **Stripe Signature Verification** - Webhook validates requests from Stripe
4. **File Uploads** - Custom design files uploaded to secure storage
5. **Email Privacy** - Only send to verified user emails

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
```

## Future Enhancements

1. **Bulk Order Discounts** - Automatic pricing tiers
2. **Order History** - Customer-facing order tracking
3. **Design Templates** - Pre-made design options
4. **Expedited Shipping** - USPS Priority Mail option
5. **International Shipping** - Additional carriers
6. **Refund Processing** - Admin refund interface
7. **Inventory Management** - Track product stock
8. **Reorder Button** - One-click repeat orders

## Support

For issues or questions:
- Check Stripe dashboard for payment issues
- Review webhook logs for processing errors
- Verify email sending in Resend dashboard
- Check PrintOrder table for order status

---

**Status:** ✅ Production Ready
**Last Updated:** 2024
**Version:** 1.0.0
