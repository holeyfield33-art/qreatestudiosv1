# 🚀 Vercel Deployment Guide

**Project:** Qreate Studios v1  
**Date:** January 14, 2026

---

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure:

- [x] All TypeScript errors resolved
- [x] Database schema validated
- [ ] Production database ready
- [ ] All environment variables prepared
- [ ] Build completes successfully locally
- [ ] Manual testing completed

---

## 🎯 Deployment Methods

### Method 1: Vercel CLI (Recommended)

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Link Project

```bash
cd /workspaces/qreatestudiosv1
vercel link
```

Follow prompts:
- Set up and deploy: **Yes**
- Which scope: **Select your account**
- Link to existing project: **No** (first time) or **Yes** (if exists)
- What's your project's name: **qreatestudios** (or your choice)
- In which directory: **./** (current directory)

#### 4. Set Environment Variables

```bash
# Set all required environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add OPENAI_API_KEY production
vercel env add BLOB_READ_WRITE_TOKEN production
# ... add all other variables

# Or add via dashboard for easier management
```

#### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod
```

This will:
1. Build your application
2. Upload to Vercel
3. Configure DNS
4. Assign a production URL

---

### Method 2: GitHub Integration (Continuous Deployment)

#### 1. Push Code to GitHub

```bash
# If not already done
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### 2. Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select **GitHub**
4. Find your repository: `holeyfield33-art/qreatestudiosv1`
5. Click "Import"

#### 3. Configure Project

**Build & Development Settings:**
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: **./** (leave empty)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

#### 4. Add Environment Variables

In the "Environment Variables" section, add all from [PRODUCTION_INFRASTRUCTURE_SETUP.md](./PRODUCTION_INFRASTRUCTURE_SETUP.md):

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
OPENAI_API_KEY
BLOB_READ_WRITE_TOKEN
GITHUB_ID (optional)
GITHUB_SECRET (optional)
UNSPLASH_ACCESS_KEY (optional)
NEXT_PUBLIC_MAPBOX_TOKEN (optional)
```

Select environment: **Production**, **Preview**, **Development**

#### 5. Deploy

Click **"Deploy"**

Vercel will:
- Clone repository
- Install dependencies
- Run build
- Deploy to production
- Assign URL

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain Setup

#### Add Domain

```bash
# Via CLI
vercel domains add yourdomain.com

# Or via dashboard:
# Project Settings > Domains > Add Domain
```

#### Configure DNS

Add these DNS records at your domain registrar:

**Option A: Using Vercel nameservers (Recommended)**
```
Type: NS
Name: @ (or your subdomain)
Value: ns1.vercel-dns.com
Value: ns2.vercel-dns.com
```

**Option B: Using A/CNAME records**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For subdomains:**
```
Type: CNAME
Name: app (or your subdomain)
Value: cname.vercel-dns.com
```

### 2. Update NEXTAUTH_URL

After domain is configured:

```bash
# Update environment variable
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# Enter: https://yourdomain.com
```

### 3. Update Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Update endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` if it changed

### 4. Update OAuth Callbacks

If using GitHub OAuth:
1. Go to GitHub OAuth App settings
2. Update Homepage URL: `https://yourdomain.com`
3. Update Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

---

## 📊 Vercel Project Settings

### Build & Development Settings

```yaml
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
Node.js Version: 20.x
```

### Functions

```yaml
Region: Nearest to target users (auto)
Max Duration: 10s (Hobby/Pro) or 60s (Enterprise)
Memory: 1024 MB (default)
```

### Environment Variables

See [PRODUCTION_INFRASTRUCTURE_SETUP.md](./PRODUCTION_INFRASTRUCTURE_SETUP.md) for complete list.

### Git Integration

```yaml
Production Branch: main
Automatic Deployments: Enabled
Deploy Hooks: (optional, for external triggers)
```

---

## 🔄 Continuous Deployment Workflow

### Automatic Deployments

With GitHub integration:

**Production:**
```bash
git push origin main
# Automatically deploys to production
```

**Preview:**
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Automatically creates preview deployment
```

### Manual Deployments

```bash
# Production
vercel --prod

# Preview
vercel

# With specific project
vercel --prod --cwd /path/to/project
```

---

## 🧪 Testing Deployment

### 1. Verify Deployment

```bash
# Check deployment status
vercel ls

# Get deployment URL
vercel inspect <deployment-url>
```

### 2. Test Critical Paths

Visit your deployed site and test:

- [ ] Homepage loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard accessible
- [ ] QR code creation works
- [ ] Analytics display correctly
- [ ] Payment flow completes
- [ ] API routes respond
- [ ] Images upload/display
- [ ] Landing pages render

### 3. Check Logs

```bash
# View deployment logs
vercel logs <deployment-url>

# Stream runtime logs
vercel logs --follow
```

---

## 🔍 Monitoring & Analytics

### Vercel Analytics

Automatically enabled. View at:
```
https://vercel.com/[your-account]/qreatestudios/analytics
```

Provides:
- Page views
- Top pages
- Visitor countries
- Device types
- Performance metrics

### Runtime Logs

```bash
# View logs in real-time
vercel logs --follow

# Filter by function
vercel logs --follow --output /api/qr/route

# View logs for specific deployment
vercel logs <deployment-url>
```

### Speed Insights

Free for all Vercel deployments:
```
https://vercel.com/[your-account]/qreatestudios/speed-insights
```

---

## 🚨 Troubleshooting

### Build Failures

**Issue:** Build fails during deployment

```bash
# Check build logs
vercel logs <deployment-url>

# Common fixes:
1. Clear cache and rebuild:
   vercel --force
   
2. Verify environment variables:
   vercel env ls

3. Test build locally:
   npm run build
```

### Environment Variables Not Working

```bash
# Verify they're set correctly
vercel env ls

# Pull env vars locally for testing
vercel env pull .env.local

# Remove and re-add if needed
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

### Database Connection Issues

**Issue:** Can't connect to database

```bash
# Verify DATABASE_URL is set
vercel env ls | grep DATABASE_URL

# Check database allows Vercel's IP ranges
# Most managed DBs need to allowlist Vercel IPs
# Or use connection pooling
```

### Function Timeouts

**Issue:** API routes timing out

```bash
# For Hobby/Pro: Max 10s
# For Enterprise: Max 60s

# Optimize slow operations:
# 1. Add database indexes
# 2. Use caching
# 3. Move heavy processing to background jobs
```

### Custom Domain Not Working

**Issue:** Domain doesn't resolve

```bash
# Check DNS propagation (can take 24-48 hours)
dig yourdomain.com

# Verify DNS records are correct
vercel domains inspect yourdomain.com

# Try removing and re-adding domain
vercel domains rm yourdomain.com
vercel domains add yourdomain.com
```

---

## 🔄 Rollback Procedure

### Rollback to Previous Deployment

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

### Via Dashboard

1. Go to project on Vercel
2. Click "Deployments" tab
3. Find working deployment
4. Click "..." menu
5. Select "Promote to Production"

---

## 🎛️ Advanced Configuration

### vercel.json Configuration

Create `vercel.json` for advanced settings:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "/dashboard/admin/:path*"
    }
  ]
}
```

### Edge Functions

For ultra-fast responses, use Edge Runtime:

```typescript
// app/api/edge-example/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  return Response.json({ message: 'Hello from Edge!' });
}
```

---

## 📈 Performance Optimization

### 1. Enable ISR (Incremental Static Regeneration)

```typescript
// For frequently accessed pages
export const revalidate = 3600; // Revalidate every hour
```

### 2. Enable Caching

```typescript
// For stable content
export const dynamic = 'force-static';

// For dynamic content with caching
export const revalidate = 60;
```

### 3. Image Optimization

Already configured with Next.js Image component:

```typescript
import Image from 'next/image';

<Image 
  src="/image.jpg" 
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

- Never commit `.env` files
- Use Vercel's encrypted environment variables
- Rotate secrets regularly
- Use different values for production/preview/development

### 2. API Protection

- All API routes should check authentication
- Implement rate limiting
- Validate all inputs
- Use HTTPS only

### 3. Database Security

- Use SSL connections
- Enable connection pooling
- Restrict database access to Vercel IPs
- Regular backups

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables prepared
- [ ] Database ready and migrated
- [ ] Stripe configured
- [ ] Email service configured

### During Deployment
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build completes successfully
- [ ] Deployment URL works

### Post-Deployment
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] All auth methods work
- [ ] Payment flow tested
- [ ] Email sending works
- [ ] Analytics tracking
- [ ] Error monitoring setup
- [ ] Backups configured

---

## 📞 Support

**Vercel Support:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Email: support@vercel.com

**Project Issues:**
- GitHub: https://github.com/holeyfield33-art/qreatestudiosv1/issues

---

## 🎉 Success!

Once deployment is complete and all checks pass, your application is live! 🚀

Visit your production URL and start serving users!

---

**Last Updated:** January 14, 2026
