# 🚀 Quick Reference Card

## Three Features - Three Steps Each

### 🗺️ **Mapbox Analytics**
1. **View**: Go to `/dashboard/analytics`
2. **Interact**: Click markers for scan details
3. **Export**: Click "Export PNG" button

### 🤖 **AI Optimization**
1. **Open**: Click "✨ AI Optimize" on QR details page
2. **Wait**: GPT-4 analyzes (3-5 seconds)
3. **Apply**: Review suggestions and implement

### 📦 **NFC Orders**
1. **Order**: Click "Get Physical NFC Card/Sticker" button
2. **Checkout**: Add products → Proceed to checkout → Pay
3. **Fulfill**: Admin panel at `/dashboard/orders` → Update status → Ship

---

## 🔑 Test Credentials

**Stripe Test Card:**
```
4242 4242 4242 4242
Expiry: 12/34 | CVC: 123 | ZIP: 12345
```

**Tracking Number Example:**
```
1Z999AA10123456784
```

---

## 🛠️ Quick Commands

```bash
# Start dev server
npm run dev

# Check for errors
npm run build

# Test Stripe webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# View database
npx prisma studio

# Run migrations
npx prisma migrate dev
```

---

## 📂 Key Files Cheat Sheet

```
Analytics:
  /components/analytics/MapboxHeatmap.tsx
  /app/dashboard/analytics/page.tsx

AI Optimize:
  /lib/ai/qr-optimizer.ts
  /components/qr/AIOptimizationDialog.tsx
  /app/api/ai/optimize-qr/route.ts

NFC Orders:
  /lib/types/nfc-products.ts
  /app/dashboard/qr-codes/[id]/order-nfc/page.tsx
  /components/admin/NFCOrdersPanel.tsx
  /app/dashboard/orders/page.tsx
  /app/api/orders/nfc/checkout/route.ts
```

---

## 🔥 Most Common Tasks

### Add new NFC product
Edit: `/lib/types/nfc-products.ts`

### Change AI credit limits
Edit: `/lib/ai/qr-optimizer.ts` → `checkAICredits()`

### Customize email templates
Edit: `/app/api/stripe/webhook/route.ts` (admin/customer)
Edit: `/app/api/admin/orders/[orderId]/ship/route.ts` (shipping)

### Update status workflow
Edit: `/components/admin/NFCOrdersPanel.tsx`

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Map not loading | Check `NEXT_PUBLIC_MAPBOX_TOKEN` |
| AI optimize fails | Check `OPENAI_API_KEY` |
| Checkout errors | Check Stripe keys in `.env` |
| Emails not sending | Check `RESEND_API_KEY` |
| Webhook not working | Check `STRIPE_WEBHOOK_SECRET` |
| Admin panel 403 | User needs ADMIN role |

---

## 📊 Status Workflows

**NFC Order Status:**
```
Paid → Encoding → Encoded → Shipped → Delivered
```

**QR Code Status:**
```
Active → Paused → Archived
```

---

## 🎯 Feature URLs

```
Analytics Dashboard:     /dashboard/analytics
AI Optimization:         /dashboard/qr-codes/[id]  (click AI button)
NFC Order Page:          /dashboard/qr-codes/[id]/order-nfc
Admin Orders:            /dashboard/orders
```

---

## 💰 Pricing (NFC Products)

| Product | Price | Shipping |
|---------|-------|----------|
| Blank Card | $4.99 | Free >$15 |
| Custom Card | $6.99 | Free >$15 |
| 10-Pack Stickers | $14.99 | FREE |
| 50-Pack Stickers | $59.99 | FREE |

---

## 📧 Email Triggers

| Event | Recipient | Template |
|-------|-----------|----------|
| Payment Complete | Admin | Fulfillment email |
| Payment Complete | Customer | Confirmation email |
| Order Shipped | Customer | Shipping email |

---

## 🎨 Color Codes

**Mapbox Markers:**
- 🔴 Red: High activity (50+ scans)
- 🟡 Yellow: Medium (10-49 scans)
- 🔵 Blue: Low (1-9 scans)

**Status Badges:**
- 🔵 Paid: `bg-blue-100`
- 🟡 Encoding: `bg-yellow-100`
- 🟣 Encoded: `bg-purple-100`
- 🟢 Shipped: `bg-green-100`
- ⚫ Delivered: `bg-gray-100`

---

## 📱 API Endpoints

```
GET  /api/analytics/scans           - Get scan data
POST /api/ai/optimize-qr             - Run AI optimization
GET  /api/ai/credits                 - Get AI credit balance

POST /api/orders/nfc/checkout        - Create NFC order
GET  /api/admin/orders/nfc           - List NFC orders
PATCH /api/admin/orders/:id/status   - Update status
POST /api/admin/orders/:id/ship      - Mark shipped

POST /api/stripe/webhook             - Handle payments
```

---

## 🔐 Required Roles

| Endpoint | Role Required |
|----------|---------------|
| Mapbox Analytics | Any user |
| AI Optimization | Pro+ (Free: 0 credits) |
| NFC Order | Any user |
| Admin Panel | ADMIN |

---

**Print this card for quick reference! 📄**

---

Version 1.0.0 | Updated: Jan 5, 2026
