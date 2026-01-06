# NFC Ordering - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Customer Flow
1. Go to any QR code details page
2. Click **"Get Physical NFC Card/Sticker"** button (animated, below QR preview)
3. Select products → Adjust quantities → Upload custom designs (optional)
4. Click **"Proceed to Checkout"**
5. Complete payment in Stripe Checkout
6. Receive confirmation email

### Admin Fulfillment Flow
1. Navigate to **`/dashboard/orders`**
2. Click **"NFC Orders"** tab
3. Click **"Copy"** on encode URL → Program NFC devices
4. Click **"Mark as Encoding"** → **"Mark as Encoded"**
5. Click **"Mark as Shipped"** → Enter tracking number
6. Customer automatically receives shipping notification

## 📦 Product Catalog

| Product | Price | Description |
|---------|-------|-------------|
| **Blank NFC Card** | $2.99 | Standard NFC card |
| **Custom NFC Card** | $4.99 | With uploaded design |
| **10-Pack Stickers** | $14.99 | NFC stickers |
| **50-Pack Stickers** | $59.99 | Bulk stickers |

**Shipping:** Free on $15+, otherwise $2.99

## 🔄 Status Workflow

```
Paid → Encoding → Encoded → Shipped → Delivered
```

## 🛠️ Key Files

```bash
# User Flow
/app/dashboard/qr-codes/[id]/order-nfc/page.tsx    # Product selection
/app/api/orders/nfc/checkout/route.ts              # Create order

# Admin Flow  
/app/dashboard/orders/page.tsx                     # Orders page
/components/admin/NFCOrdersPanel.tsx               # Fulfillment panel

# Processing
/app/api/stripe/webhook/route.ts                   # Payment handler
/app/api/admin/orders/[orderId]/ship/route.ts      # Shipping

# Configuration
/lib/types/nfc-products.ts                         # Product catalog
```

## 🎯 Admin Features

### Search & Filter
- Search: order #, customer name, email
- Filter: status (Paid, Encoding, Encoded, Shipped, Delivered)

### Quick Actions
- 📋 Copy encode URL (one-click)
- 📍 Copy shipping address (formatted)
- 🔄 Update status (workflow buttons)
- 🚚 Add tracking number (with email notification)
- 🖨️ Print packing slip

## 📧 Automated Emails

### Admin Fulfillment Email
Sent when payment completes:
- ✅ Order number and date
- ✅ **Encode URL** (large, bold, easy to copy)
- ✅ Product list with quantities
- ✅ Shipping address (formatted)
- ✅ Customer contact info

### Customer Confirmation Email
Sent when payment completes:
- ✅ Order confirmation
- ✅ Product details
- ✅ Shipping address
- ✅ 2-day delivery estimate

### Customer Shipping Email
Sent when marked as shipped:
- ✅ Tracking number
- ✅ Shipping address
- ✅ 3-5 day delivery estimate

## 🔐 Security

- ✅ Order ownership verified
- ✅ Admin-only endpoints
- ✅ Stripe webhook signature validation
- ✅ Secure file uploads

## 🐛 Troubleshooting

### Payment Issues
1. Check Stripe dashboard for webhook events
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check webhook logs in `/api/stripe/webhook`

### Email Issues
1. Verify `RESEND_API_KEY` in `.env`
2. Check Resend dashboard for delivery logs
3. Confirm email addresses are verified

### Order Not Appearing
1. Check `PrintOrder` table in database
2. Verify `productType='nfc'`
3. Check admin role in user table

## 📱 Testing with Stripe Test Mode

```bash
# Test Cards
4242 4242 4242 4242  # Success
4000 0000 0000 9995  # Declined

# Webhook Testing
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🎨 Customization

### Update Product Catalog
Edit `/lib/types/nfc-products.ts`:
```typescript
export const NFC_PRODUCTS = [
  {
    id: 'nfc-new-product',
    name: 'New Product',
    price: 9.99,
    // ...
  }
];
```

### Modify Status Workflow
Update status options in:
- `/components/admin/NFCOrdersPanel.tsx`
- `/app/api/admin/orders/[orderId]/status/route.ts`

### Customize Emails
Edit email HTML in:
- `/app/api/stripe/webhook/route.ts` (fulfillment & confirmation)
- `/app/api/admin/orders/[orderId]/ship/route.ts` (shipping notification)

## ✅ Launch Checklist

- [ ] Test complete order flow (dev → staging → prod)
- [ ] Verify webhook receives events
- [ ] Confirm emails send correctly
- [ ] Test admin panel permissions
- [ ] Validate shipping calculations
- [ ] Set up production Stripe keys
- [ ] Configure production email domain
- [ ] Test with real payment (small amount)

## 🆘 Need Help?

1. Check [NFC_ORDERING_SYSTEM_COMPLETE.md](./NFC_ORDERING_SYSTEM_COMPLETE.md) for full docs
2. Review API endpoint logs
3. Test with Stripe test cards
4. Verify environment variables

---

**Status:** ✅ Ready to Use  
**Version:** 1.0.0
