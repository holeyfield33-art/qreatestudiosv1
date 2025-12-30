# 🚀 Qreate Studios v1.1 - Quick Start Guide

## Get Up and Running in 10 Minutes

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Stripe account (for billing)
- OpenAI API key (for AI features)
- Resend account (for emails)

---

## Step 1: Clone and Install (2 min)

```bash
# Navigate to project
cd /workspaces/qreatestudiosv1

# Install dependencies (if not already done)
npm install

# Dependencies installed:
# ✅ Next.js 15.5.9
# ✅ Stripe 20.1.0
# ✅ OpenAI 6.15.0
# ✅ Resend 4.0.1
# ✅ Prisma 5.22.0
# ✅ NextAuth 5.0.0-beta.30
```

---

## Step 2: Environment Setup (3 min)

Create `.env.local`:

```bash
# Copy example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Minimum required for local development:**

```bash
# Database (use Docker or cloud)
DATABASE_URL="postgresql://user:password@localhost:5432/qreate"

# Auth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (get from dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # After setting up webhook

# Stripe Prices (create products first)
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_BUSINESS_MONTHLY="price_..."
STRIPE_PRICE_AGENCY_MONTHLY="price_..."

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Resend (for development, use sandbox)
RESEND_API_KEY="re_..."
FROM_EMAIL="onboarding@resend.dev"
ADMIN_EMAIL="you@example.com"
SUPPORT_EMAIL="support@example.com"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin users
ADMIN_EMAILS="you@example.com"
```

---

## Step 3: Database Setup (2 min)

```bash
# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

---

## Step 4: Create Stripe Products (3 min)

1. Go to https://dashboard.stripe.com/test/products
2. Click **"Add Product"**
3. Create 3 products:

**Product 1: Pro Plan**
- Name: "Pro Plan"
- Description: "50 QR codes, 100k AI tokens"
- Price: $29/month (recurring)
- Copy price ID → `STRIPE_PRICE_PRO_MONTHLY`

**Product 2: Business Plan**
- Name: "Business Plan"
- Description: "Unlimited QR codes, 500k AI tokens"
- Price: $79/month (recurring)
- Copy price ID → `STRIPE_PRICE_BUSINESS_MONTHLY`

**Product 3: Agency Plan**
- Name: "Agency Plan"
- Description: "White-label, 1M AI tokens, API access"
- Price: $249/month (recurring)
- Copy price ID → `STRIPE_PRICE_AGENCY_MONTHLY`

4. Update `.env.local` with the price IDs

---

## Step 5: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Step 6: Create Your First Account

1. Click **"Get Started"**
2. Fill in the signup form
3. Sign in with your credentials
4. You're in the dashboard! 🎉

---

## Step 7: Test Key Features

### Create a QR Code
1. Navigate to **QR Codes**
2. Click **"Create QR Code"**
3. Choose type: URL
4. Enter a URL
5. Click **"Create"**
6. Download and scan!

### Try AI Generation
1. Navigate to **AI Tools**
2. Select a tool (e.g., Blog Post Writer)
3. Enter a prompt
4. Generate content
5. Copy and use!

### Create a Landing Page
1. Navigate to **Landing Pages**
2. Click **"Create Landing Page"**
3. Choose a template
4. Customize content
5. Publish!
6. View live at `/l/your-slug`

### Order a Print
1. Go to **QR Codes**
2. Select a QR code
3. Click **"Order Print"**
4. Choose product type
5. Enter shipping address
6. Submit order
7. Check your email! 📧

---

## Common First-Time Issues

### Database Connection Error
```bash
# Make sure PostgreSQL is running
# Try connecting:
psql -U user -d qreate

# Reset database if needed:
npx prisma migrate reset
```

### Stripe Webhook Not Working Locally
```bash
# Install Stripe CLI:
brew install stripe/stripe-cli/stripe

# Forward webhooks:
stripe listen --forward-to localhost:3000/api/billing/webhook

# Copy webhook secret to .env.local
```

### Email Not Sending
```bash
# For development, use Resend sandbox:
FROM_EMAIL="onboarding@resend.dev"

# No domain verification needed in sandbox mode
# Emails go to your Resend account email
```

---

## Testing with Test Data

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Test Print Order
```
Product: Sticker
Quantity: 10
Size: 3x3 inches
Material: Vinyl
Finish: Glossy
```

---

## Verify Everything Works

### Checklist:
- [ ] Homepage loads
- [ ] Can signup/signin
- [ ] Dashboard shows
- [ ] Can create QR code
- [ ] QR code scans work
- [ ] Analytics track
- [ ] Can create landing page
- [ ] AI generation works
- [ ] Print order creates
- [ ] Emails received (check spam!)
- [ ] Billing page shows plans
- [ ] Checkout flow works

---

## Next Steps After Setup

### 1. Configure Stripe Webhook
```bash
# In production, set webhook URL:
https://yourdomain.com/api/billing/webhook

# Select these events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### 2. Set Up Resend Domain
```bash
# Add your domain in Resend dashboard
# Add DNS records provided
# Wait for verification
# Update FROM_EMAIL to use your domain
```

### 3. Make Yourself Admin
```bash
# Add your email to .env.local:
ADMIN_EMAILS="you@example.com"

# Restart server
# Visit /dashboard/admin
```

### 4. Customize Branding
- Update logo in `/public`
- Customize colors in `tailwind.config.ts`
- Update meta tags in `/app/layout.tsx`
- Update email templates in `/lib/services/email-service.ts`

---

## Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL to production URLs
```

### Other Platforms
- **Railway**: Connect GitHub repo, add env vars
- **Render**: Connect repo, add env vars, set build command
- **Netlify**: Connect repo, add env vars, enable Next.js plugin

---

## Get Help

### Documentation
- `FINAL_INTEGRATION_SUMMARY.md` - Complete feature overview
- `WIRING_COMPLETE.md` - Integration details
- `BILLING_SYSTEM_COMPLETE.md` - Billing documentation
- `LANDING_PAGE_SYSTEM_COMPLETE.md` - Landing page docs

### Support
- Email: support@qreatestudios.com
- Issues: File on GitHub repository

---

## What's Working Right Now

✅ User authentication
✅ QR code creation and scanning  
✅ QR code analytics
✅ Payment QR codes (7 providers)
✅ AI content generation (8 tools)
✅ Landing page builder (10 templates)
✅ Digital menus
✅ Print order system with emails
✅ Billing and subscriptions
✅ CRM (contacts, tasks, notes)
✅ Security scanning
✅ Admin dashboard
✅ Legal pages

---

## You're All Set! 🎉

Qreate Studios v1.1 is now running on your machine.

**Happy building!**

---

**Version**: 1.1.0  
**Last Updated**: December 30, 2025  
**Status**: Production Ready ✅
