# 🚀 Production Infrastructure Setup Guide

**Project:** Qreate Studios v1  
**Date:** January 14, 2026  
**Status:** Ready for Production Deployment

---

## 📋 Overview

This guide walks you through setting up all required infrastructure for production deployment.

---

## 1️⃣ Database Setup (PostgreSQL)

### Option A: Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database**
   ```bash
   # Via Vercel Dashboard
   # 1. Go to vercel.com/dashboard
   # 2. Select your project
   # 3. Go to Storage > Create Database
   # 4. Select Postgres
   # 5. Choose region closest to users
   ```

2. **Get Connection String**
   - Copy the `DATABASE_URL` from Vercel dashboard
   - Will be in format: `postgres://user:pass@host:5432/dbname?sslmode=require`

### Option B: Supabase

1. **Create Project**
   - Go to supabase.com
   - Create new project
   - Select region

2. **Get Connection String**
   - Go to Settings > Database
   - Copy "Connection string" (Pooled mode)

### Option C: Railway

1. **Deploy PostgreSQL**
   - Go to railway.app
   - New Project > Deploy PostgreSQL
   - Copy connection string from Variables tab

### Run Migrations

```bash
# Set DATABASE_URL in .env
DATABASE_URL="your_production_database_url"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Optional: Seed initial data
npx prisma db seed
```

---

## 2️⃣ Environment Variables

### Required Variables

Create `.env.production` or set in Vercel dashboard:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://..."

# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# ============================================
# AUTHENTICATION (NextAuth)
# ============================================
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="[GENERATE_RANDOM_STRING_64_CHARS]"

# Generate with: openssl rand -base64 64
# Or: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# GitHub OAuth (Optional)
GITHUB_ID="your_github_oauth_client_id"
GITHUB_SECRET="your_github_oauth_client_secret"

# ============================================
# STRIPE
# ============================================
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Get from: https://dashboard.stripe.com/apikeys

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY="re_..."

# Get from: https://resend.com/api-keys

# ============================================
# AI (OpenAI)
# ============================================
OPENAI_API_KEY="sk-..."

# Get from: https://platform.openai.com/api-keys

# ============================================
# IMAGE STORAGE (Vercel Blob)
# ============================================
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Auto-configured in Vercel when you add Blob storage

# ============================================
# IMAGE SEARCH (Unsplash) - Optional
# ============================================
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"

# Get from: https://unsplash.com/oauth/applications

# ============================================
# MAPS (Mapbox) - Optional
# ============================================
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1..."

# Get from: https://account.mapbox.com/access-tokens/
```

### Generate Secrets Script

```bash
# Run this to generate secure secrets
node -e "
console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(64).toString('base64'));
console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'));
"
```

---

## 3️⃣ Stripe Configuration

### 1. Create Products & Prices

```bash
# In Stripe Dashboard (https://dashboard.stripe.com)

# Create 4 Products:
# 1. FREE Plan - $0/month (for reference only)
# 2. PRO Plan - $29/month
# 3. BUSINESS Plan - $99/month
# 4. AGENCY Plan - $299/month

# For each product, create a recurring price
# Save the price IDs (they look like: price_xxxxxxxxxxxxx)
```

### 2. Configure Webhook

```bash
# 1. Go to: https://dashboard.stripe.com/webhooks
# 2. Add endpoint: https://your-domain.com/api/stripe/webhook
# 3. Select events:
#    - checkout.session.completed
#    - customer.subscription.created
#    - customer.subscription.updated
#    - customer.subscription.deleted
#    - invoice.payment_succeeded
#    - invoice.payment_failed
# 4. Copy the webhook signing secret (whsec_...)
# 5. Add to STRIPE_WEBHOOK_SECRET in env vars
```

### 3. Test Webhooks

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

---

## 4️⃣ Email Service (Resend)

### Setup

1. **Create Account**
   - Go to resend.com
   - Sign up/Login

2. **Verify Domain**
   ```bash
   # Add DNS records provided by Resend:
   # TXT record for domain verification
   # MX records for email receiving
   # DKIM records for email authentication
   ```

3. **Get API Key**
   - Go to API Keys section
   - Create new key
   - Copy to `RESEND_API_KEY`

4. **Test Email**
   ```typescript
   // Test in your app
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await resend.emails.send({
     from: 'noreply@yourdomain.com',
     to: 'test@example.com',
     subject: 'Test Email',
     html: '<p>It works!</p>'
   });
   ```

---

## 5️⃣ OpenAI API

### Setup

1. **Create Account**
   - Go to platform.openai.com
   - Sign up and add payment method

2. **Generate API Key**
   - Go to API Keys section
   - Create new secret key
   - Copy to `OPENAI_API_KEY`

3. **Set Usage Limits**
   - Go to Settings > Limits
   - Set monthly spending limit (e.g., $100)
   - Set email alerts

4. **Monitor Usage**
   - Check usage at: platform.openai.com/usage
   - Your app tracks usage in `AIUsage` model

---

## 6️⃣ Vercel Blob Storage

### Setup

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Blob"
   - Confirm creation

2. **Token Configuration**
   - Token is auto-configured as `BLOB_READ_WRITE_TOKEN`
   - Check in Environment Variables

3. **Test Upload**
   ```typescript
   import { put } from '@vercel/blob';
   
   const blob = await put('test.txt', 'Hello World', {
     access: 'public',
   });
   console.log(blob.url); // https://...vercel-storage.com/test.txt
   ```

---

## 7️⃣ GitHub OAuth (Optional)

### Setup

1. **Create OAuth App**
   - Go to github.com/settings/developers
   - Click "New OAuth App"
   - Fill in:
     - Name: Qreate Studios
     - Homepage: https://your-domain.com
     - Callback: https://your-domain.com/api/auth/callback/github

2. **Get Credentials**
   - Copy Client ID to `GITHUB_ID`
   - Generate secret and copy to `GITHUB_SECRET`

---

## 8️⃣ Unsplash API (Optional)

### Setup

1. **Create Application**
   - Go to unsplash.com/oauth/applications
   - Create new application
   - Accept terms

2. **Get Access Key**
   - Copy Access Key to `UNSPLASH_ACCESS_KEY`

---

## 9️⃣ Mapbox (Optional)

### Setup

1. **Create Account**
   - Go to mapbox.com
   - Sign up (free tier available)

2. **Get Token**
   - Go to account.mapbox.com/access-tokens
   - Copy default public token
   - Or create new token with these scopes:
     - styles:read
     - fonts:read

3. **Add to Environment**
   - Add to `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## 🔧 Vercel Project Configuration

### 1. Create Project

```bash
# Via CLI
npm i -g vercel
vercel login
vercel link
```

### 2. Configure Build Settings

In Vercel Dashboard:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### 3. Environment Variables

Add all variables from section 2 above:
- Go to Settings > Environment Variables
- Add each variable
- Select environments (Production, Preview, Development)

### 4. Framework Preset

- Should auto-detect: "Next.js"
- Node Version: 20.x (recommended)

---

## 🔒 Security Configuration

### 1. CORS Headers

Add to `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
      ],
    },
  ]
}
```

### 2. Content Security Policy

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        },
      ],
    },
  ]
}
```

### 3. Rate Limiting

Consider adding rate limiting middleware:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## ✅ Verification Checklist

After setup, verify each service:

### Database
- [ ] Connection successful
- [ ] Migrations applied
- [ ] Can create/read records

### Authentication
- [ ] Can sign up new user
- [ ] Can sign in with credentials
- [ ] GitHub OAuth works (if enabled)
- [ ] Sessions persist correctly

### Stripe
- [ ] Test checkout flow
- [ ] Webhook receives events
- [ ] Subscriptions update correctly
- [ ] Customer portal accessible

### Email
- [ ] Domain verified
- [ ] Test email sends successfully
- [ ] Emails not in spam

### OpenAI
- [ ] API key valid
- [ ] Test completion works
- [ ] Usage tracked correctly

### Blob Storage
- [ ] Can upload files
- [ ] Files publicly accessible
- [ ] URLs work correctly

### Optional Services
- [ ] GitHub OAuth (if enabled)
- [ ] Unsplash search (if enabled)
- [ ] Mapbox maps (if enabled)

---

## 📊 Monitoring Setup

### 1. Vercel Analytics

```bash
# Automatically enabled for all Vercel deployments
# View at: vercel.com/your-project/analytics
```

### 2. Error Tracking (Sentry - Recommended)

```bash
npm install @sentry/nextjs

# Run setup wizard
npx @sentry/wizard@latest -i nextjs
```

### 3. Uptime Monitoring

Consider:
- Vercel Monitoring (built-in)
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🚨 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db push --skip-generate

# Check SSL mode
# Add to DATABASE_URL: ?sslmode=require

# Verify IP allowlist (if using managed DB)
```

### Environment Variables Not Working

```bash
# Redeploy after adding variables
vercel --prod

# Check variable names (case-sensitive)
# Check they're added to correct environment
```

### Stripe Webhook Not Receiving Events

```bash
# Verify webhook URL is correct
# Check endpoint is publicly accessible
# Verify SSL certificate is valid
# Check Stripe Dashboard > Webhooks > Logs
```

---

## 📞 Support Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Support:** https://vercel.com/support
- **Prisma Docs:** https://www.prisma.io/docs
- **Stripe Docs:** https://stripe.com/docs
- **NextAuth Docs:** https://authjs.dev/

---

## ✅ Ready for Deployment

Once all items above are complete, you're ready to deploy!

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for deployment steps.

---

**Last Updated:** January 14, 2026
