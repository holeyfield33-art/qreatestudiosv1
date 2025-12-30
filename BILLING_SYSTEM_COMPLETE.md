# Stripe Subscription & Billing System

## Overview

Complete subscription billing system with Stripe integration, usage enforcement, admin dashboard, and security moderation for Qreate Studios.

## Features Implemented

### 1. Stripe Service (`/lib/services/stripe-service.ts`)
- **Plan Limits Configuration**
  - FREE: 3 QR codes, 10k AI tokens
  - PRO: 50 QR codes, 100k AI tokens
  - BUSINESS: Unlimited QR codes, 500k AI tokens
  - AGENCY: Unlimited QR codes, 1M AI tokens

- **Stripe Functions**
  - `createCheckoutSession()` - Start subscription checkout
  - `createBillingPortalSession()` - Customer billing management
  - `cancelSubscription()` - Cancel at period end
  - `reactivateSubscription()` - Reactivate canceled subscription

### 2. Billing API Endpoints

#### `/api/billing/checkout` (POST)
- Creates Stripe checkout session for plan upgrade
- Requires: `{ plan: 'PRO' | 'BUSINESS' | 'AGENCY' }`
- Returns: `{ success: true, url: string }`

#### `/api/billing/portal` (POST)
- Creates Stripe billing portal session
- Allows customers to manage subscription, payment methods, invoices
- Returns: `{ success: true, url: string }`

#### `/api/stripe/webhook` (POST)
- Handles Stripe webhook events:
  - `checkout.session.completed` - Activate new subscription
  - `customer.subscription.updated` - Update subscription status
  - `customer.subscription.deleted` - Cancel subscription
  - `invoice.payment_failed` - Mark as past due
- Requires Stripe signature verification

### 3. Usage Enforcement (`/lib/services/usage-enforcement.ts`)

Functions:
- `canCreateQR(userId)` - Check QR code limit
- `canUseAI(userId)` - Check AI access
- `canCreatePrintOrder(userId)` - Check print order access
- `canAccessCRM(userId)` - Check CRM access
- `getUserPlan(userId)` - Get current plan
- `getUserLimits(userId)` - Get all limits and usage

Integrated into:
- `/api/qr/route.ts` - QR creation blocked if limit reached
- `/api/ai/generate/route.ts` - AI usage blocked if token limit exceeded

### 4. User APIs

#### `/api/user/subscription` (GET)
- Returns current subscription details
- Includes plan, status, billing period

#### `/api/user/limits` (GET)
- Returns usage statistics
- Shows QR codes used/limit, AI tokens used/limit

### 5. Admin Dashboard (`/app/dashboard/admin/page.tsx`)

**Platform Stats Cards:**
- Total users with weekly growth
- Total QR codes with active count
- Total scans with monthly count
- Monthly recurring revenue (MRR) with subscription count

**Subscription Breakdown:**
- Visual grid showing user count per plan (FREE/PRO/BUSINESS/AGENCY)

**Recent Activity:**
- Latest 5 user registrations with plan badges
- Pending security reports requiring review

**Navigation:**
- Link to print orders dashboard
- Quick access to moderation tools

### 6. Security Moderation System

#### `/app/api/security/reports` (POST, GET)
- POST: Create security report for suspicious QR code
- GET: List all reports (admin only) with optional status filter

#### `/app/api/security/reports/[id]` (PATCH)
- Update report status (pending/reviewed/dismissed/actioned)
- Actions:
  - `deactivate` - Disable the QR code
  - `ban` - Ban the user who created it

#### `/app/dashboard/admin/security/page.tsx`
- Tabbed interface to filter by status
- Report cards showing:
  - Report type and status badge
  - QR code name, shortCode, and URL
  - Reporter IP and timestamp
  - Description if provided
- Action buttons:
  - Dismiss - Mark as false positive
  - Deactivate QR - Disable the QR code
  - Ban User - Ban user and disable QR code

### 7. Billing Management Page (`/app/dashboard/billing/page.tsx`)

**Current Plan Section:**
- Plan name with status badge
- Monthly price (if paid plan)
- Renewal date
- Cancellation warning if scheduled
- "Manage Subscription" button → Stripe portal

**Usage Stats:**
- QR Codes progress bar (used/limit)
- AI Tokens progress bar (used/limit)
- Visual feedback when approaching limits

**Plan Features:**
- Checkmark list of all features included in current plan

**Upgrade Options:**
- Cards for higher plans (only shown if upgradeable)
- Pricing, limits, and upgrade button
- Direct checkout flow

### 8. Pricing Page (`/app/pricing/page.tsx`)

**Plan Comparison Grid:**
- 4-column responsive layout
- "Most Popular" badge on PRO plan
- Feature lists with checkmarks
- Call-to-action buttons
- Different CTAs for logged-in vs logged-out users

**FAQ Section:**
- 5 common questions with clear answers
- Topics: Plan changes, limits, trials, payment, cancellation

**Contact CTA:**
- Blue banner with "Contact Sales" button
- Enterprise inquiry prompt

## Environment Variables Required

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...
```

## Stripe Setup Instructions

1. **Create Products in Stripe Dashboard:**
   - Pro Plan - $29/month recurring
   - Business Plan - $79/month recurring
   - Agency Plan - $249/month recurring

2. **Copy Price IDs:**
   - Each product has a `price_xxxxx` ID
   - Add to environment variables

3. **Configure Webhook:**
   - Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

4. **Enable Billing Portal:**
   - In Stripe Dashboard → Settings → Billing
   - Enable Customer Portal
   - Configure allowed actions (cancel, update payment, view invoices)

## Database Schema

### Subscription Table
```prisma
model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  plan                 String    // FREE, PRO, BUSINESS, AGENCY
  status               String    // ACTIVE, CANCELED, PAST_DUE
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

### SecurityReport Table
```prisma
model SecurityReport {
  id          String    @id @default(cuid())
  qrCodeId    String
  reportType  String    // spam, malware, phishing, inappropriate
  description String?   @db.Text
  reporterIp  String?
  userAgent   String?   @db.Text
  status      String    @default("pending")
  reviewedAt  DateTime?
  reviewedBy  String?
  notes       String?   @db.Text
  createdAt   DateTime  @default(now())
}
```

## Usage Limits Enforcement

### QR Code Creation
```typescript
// In /api/qr/route.ts
const usageCheck = await canCreateQR(session.user.id);
if (!usageCheck.allowed) {
  return NextResponse.json({ 
    error: usageCheck.reason,
    limit: usageCheck.limit,
    current: usageCheck.current,
  }, { status: 403 });
}
```

### AI Token Tracking
```typescript
// In /api/ai/generate/route.ts
const canUse = await checkTokenLimit(session.user.id, estimatedTokens);
if (!canUse.allowed) {
  return NextResponse.json({
    error: canUse.reason,
    limit: canUse.limit,
    used: canUse.used,
  }, { status: 403 });
}
```

### Feature Gating Examples
```typescript
// Print orders require Pro+
const printAccess = await canCreatePrintOrder(userId);

// CRM requires Business+
const crmAccess = await canAccessCRM(userId);
```

## Testing Checklist

### Subscription Flow
- [ ] User can view pricing page
- [ ] Clicking upgrade starts Stripe checkout
- [ ] Successful payment activates subscription
- [ ] Webhook updates database correctly
- [ ] User sees upgraded plan in billing page
- [ ] Usage limits reflect new plan

### Billing Portal
- [ ] "Manage Subscription" button works
- [ ] Customer can update payment method
- [ ] Customer can view invoices
- [ ] Customer can cancel subscription
- [ ] Cancellation scheduled for period end

### Usage Enforcement
- [ ] Free user blocked at 3 QR codes
- [ ] Free user blocked from AI tools
- [ ] Pro user can create 50 QR codes
- [ ] Business user has unlimited QR codes
- [ ] AI token limits enforced per plan

### Admin Dashboard
- [ ] Stats cards show accurate counts
- [ ] Subscription breakdown displays correctly
- [ ] Recent users list populates
- [ ] Security reports section works

### Security Moderation
- [ ] Users can report QR codes
- [ ] Admin can view all reports
- [ ] Admin can dismiss reports
- [ ] Admin can deactivate QR codes
- [ ] Admin can ban users
- [ ] Actions update database correctly

## Accessibility Features

All pages meet WCAG AA standards:
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **ARIA Labels**: Proper labels for screen readers
- **Color Contrast**: Text meets 4.5:1 minimum ratio
- **Touch Targets**: Minimum 44px for mobile
- **Focus Indicators**: Visible focus states on all controls
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Progress Bars**: ARIA progressbar with value announcements
- **Status Updates**: Live regions for dynamic content

## Security Considerations

1. **Webhook Signature Verification**
   - All Stripe webhooks validated with signature
   - Prevents unauthorized access

2. **Admin-Only Endpoints**
   - Stats and moderation require `role: 'ADMIN'`
   - Checked on every request

3. **User Isolation**
   - Usage checks scoped to authenticated user
   - No cross-user data leakage

4. **Rate Limiting** (Recommended)
   - Add rate limiting to webhook endpoint
   - Prevent abuse of public APIs

## Future Enhancements

- [ ] Usage analytics dashboard
- [ ] Email notifications for limit warnings
- [ ] Team/organization billing
- [ ] Annual billing with discount
- [ ] Custom enterprise plans
- [ ] Metered billing for overage
- [ ] Referral program
- [ ] Plan comparison tool

## Support

For Stripe integration issues:
- Check webhook logs in Stripe Dashboard
- Verify environment variables are set
- Test with Stripe test mode first
- Review Stripe API logs for errors

For usage enforcement issues:
- Verify Subscription model exists in database
- Check that webhooks are processing correctly
- Confirm plan limits in stripe-service.ts
- Review Prisma schema matches expected fields
