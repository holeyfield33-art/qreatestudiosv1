# Tier-Based Access Testing Guide

## Pre-Testing Setup

### 1. Start Development Server
```bash
cd /workspaces/qreatestudiosv1
npm run dev
```

### 2. Create Test Users

You'll need to create 4 test users with different plans:

```sql
-- Run in your PostgreSQL/Supabase console

-- Create test organizations
INSERT INTO "Organization" (id, name, plan, "isWhiteLabel") VALUES
  ('org_free', 'Free Org', 'FREE', false),
  ('org_pro', 'Pro Org', 'PRO', false),
  ('org_business', 'Business Org', 'BUSINESS', false),
  ('org_agency', 'Agency Org', 'AGENCY', true);

-- Create test users (adjust based on your auth provider)
-- These are example records - adjust for your schema

-- Then link users to organizations via OrganizationMember table
```

### 3. Open Browser Tools
- Open Chrome DevTools (F12)
- Navigate to Network tab
- Navigate to Console tab

---

## Test Suite

### Test 1: FREE User - Navigation Visibility

**Login as:** FREE plan user

**Steps:**
1. Navigate to `/dashboard`
2. Look at sidebar navigation

**Expected Results:**
- ✅ All 9 navigation items visible
- ✅ "Team & CRM" shows BUSINESS badge with crown icon
- ✅ "White Label" shows AGENCY badge with crown icon
- ✅ User profile shows "FREE Plan" text
- ✅ No badges on core features (Dashboard, QR Codes, etc.)

**Screenshot:**
```
Dashboard            (no badge)
QR Codes             (no badge)
Landing Pages        (no badge)
Analytics            (no badge)
Print Shop           (no badge)
Team & CRM           👑 BUSINESS
White Label          👑 AGENCY
Billing              (no badge)
Settings             (no badge)
```

---

### Test 2: FREE User - Click CRM (Should Block)

**Login as:** FREE plan user

**Steps:**
1. Navigate to `/dashboard`
2. Click on "Team & CRM" in sidebar
3. Observe behavior

**Expected Results:**
- ✅ Alert appears: "This feature requires a BUSINESS plan. Upgrade to access Team & CRM."
- ✅ After clicking OK, redirects to `/dashboard/billing?upgrade=business`
- ✅ Billing page loads
- ✅ Business plan is highlighted or has special styling
- ✅ URL contains `?upgrade=business` parameter

**Console Check:**
- No JavaScript errors
- No 404 or 500 errors in Network tab

---

### Test 3: FREE User - Direct URL Access to CRM

**Login as:** FREE plan user

**Steps:**
1. Manually navigate to `/dashboard/crm` in address bar
2. Press Enter
3. Observe page content

**Expected Results:**
- ✅ Page loads (not 404)
- ✅ Shows upgrade prompt card with gradient border
- ✅ Crown icon visible at top
- ✅ "Unlock Team & CRM Features" heading
- ✅ 3 feature boxes visible: Team Management, Customer CRM, Advanced Analytics
- ✅ Business plan pricing shown ($49/month)
- ✅ Feature list visible (500 QR Codes, Unlimited Landing Pages, etc.)
- ✅ "Upgrade to Business" button present
- ✅ "Back to Dashboard" button present
- ✅ Text: "Redirecting to billing page in 3 seconds..."

**Timing Check:**
- Wait 3 seconds
- ✅ Automatically redirects to `/dashboard/billing?upgrade=business`

---

### Test 4: FREE User - White Label Access (Should Block)

**Login as:** FREE plan user

**Steps:**
1. Click "White Label" in sidebar
2. Observe alert and redirect

**Expected Results:**
- ✅ Alert: "This feature requires an AGENCY plan. Upgrade to access White Label."
- ✅ Redirects to `/dashboard/billing?upgrade=agency`
- ✅ Agency plan highlighted on billing page

---

### Test 5: BUSINESS User - CRM Access (Should Allow)

**Login as:** BUSINESS plan user

**Steps:**
1. Navigate to `/dashboard`
2. Look at "Team & CRM" nav item
3. Click "Team & CRM"

**Expected Results:**
- ✅ NO badge shown on "Team & CRM" (has access)
- ✅ "White Label" still shows AGENCY badge (doesn't have access)
- ✅ User profile shows "BUSINESS Plan"
- ✅ Clicking CRM navigates immediately (no alert)
- ✅ CRM page loads successfully
- ✅ Shows placeholder dashboard with:
  - Stats cards (Total Customers, Team Members, This Month)
  - "CRM System Coming Soon" card
  - Feature list under development
  - "Return to Dashboard" button

**Console Check:**
- No errors
- Network tab shows successful GET request to `/dashboard/crm`

---

### Test 6: BUSINESS User - White Label Access (Should Block)

**Login as:** BUSINESS plan user

**Steps:**
1. Click "White Label" in sidebar

**Expected Results:**
- ✅ Alert appears (not Agency plan)
- ✅ Redirects to `/dashboard/billing?upgrade=agency`

---

### Test 7: AGENCY User - Full Access

**Login as:** AGENCY plan user

**Steps:**
1. Navigate to `/dashboard`
2. Observe all navigation items
3. Click "Team & CRM"
4. Navigate back to dashboard
5. Click "White Label"

**Expected Results:**
- ✅ NO badges on any navigation items
- ✅ User profile shows "AGENCY Plan"
- ✅ CRM page loads without prompt
- ✅ White Label page loads without prompt
- ✅ White Label settings visible (branding, domain, sub-accounts)
- ✅ All forms and inputs functional

**Console Check:**
- No errors or warnings
- All API calls successful (200 status)

---

### Test 8: Session API Endpoint

**Steps:**
1. Open DevTools Network tab
2. Navigate to `/dashboard`
3. Find request to `/api/user/session`
4. Inspect response

**Expected Results for FREE user:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "free@example.com",
    "name": "Free User",
    "organization": {
      "id": "org_free",
      "plan": "FREE",
      "isWhiteLabel": false
    }
  }
}
```

**Expected Results for AGENCY user:**
```json
{
  "success": true,
  "user": {
    "id": "user_789",
    "email": "agency@example.com",
    "name": "Agency User",
    "organization": {
      "id": "org_agency",
      "plan": "AGENCY",
      "isWhiteLabel": true
    }
  }
}
```

---

### Test 9: Upgrade Flow (End-to-End)

**Login as:** FREE plan user

**Steps:**
1. Click "Team & CRM" (triggers alert)
2. Click OK on alert
3. Verify redirect to billing page with `?upgrade=business`
4. Click "Upgrade to Business" button
5. Observe Stripe checkout

**Expected Results:**
- ✅ Each step completes without errors
- ✅ Billing page highlights Business plan
- ✅ Stripe checkout opens (if configured)
- ✅ URL parameters preserved throughout flow

**Note:** Don't complete payment in test environment unless using Stripe test cards

---

### Test 10: Mobile Responsiveness

**Steps:**
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Navigate through all tier-gated features

**Expected Results:**
- ✅ Navigation items stack properly
- ✅ Badges don't overflow on small screens
- ✅ Upgrade prompt cards are mobile-friendly
- ✅ Buttons are touch-friendly (44x44px minimum)
- ✅ Text is readable without zooming

---

### Test 11: Keyboard Navigation

**Steps:**
1. Navigate to `/dashboard`
2. Press Tab repeatedly to cycle through navigation
3. Press Enter on "Team & CRM" (as FREE user)

**Expected Results:**
- ✅ Focus visible on each nav item (blue outline)
- ✅ Tab order logical (top to bottom)
- ✅ Enter key triggers same behavior as click (alert + redirect)
- ✅ All interactive elements keyboard accessible

---

### Test 12: Performance Check

**Steps:**
1. Open DevTools Performance tab
2. Start recording
3. Navigate to `/dashboard`
4. Click through several nav items
5. Stop recording

**Expected Results:**
- ✅ Initial page load < 2 seconds
- ✅ Navigation clicks < 100ms response time
- ✅ No layout shifts (CLS score close to 0)
- ✅ No memory leaks (check Memory tab)

---

### Test 13: Error Scenarios

#### 13a. Unauthenticated Access
**Steps:**
1. Sign out
2. Navigate to `/dashboard/crm` directly

**Expected Results:**
- ✅ Redirects to `/auth/signin`
- ✅ After sign in, redirects back to intended page

#### 13b. Network Failure
**Steps:**
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Navigate to `/dashboard`
4. Click "Team & CRM"

**Expected Results:**
- ✅ Graceful error handling (not white screen)
- ✅ Toast or error message visible
- ✅ "Retry" button or clear instructions

#### 13c. Invalid Plan in Database
**Steps:**
1. Manually set `Organization.plan = 'INVALID'` in database
2. Refresh dashboard

**Expected Results:**
- ✅ Falls back to FREE plan behavior
- ✅ No crashes or uncaught exceptions

---

## Automated Testing (Optional)

### Playwright Test Example

```typescript
// tests/tier-access.spec.ts
import { test, expect } from '@playwright/test'

test('FREE user sees locked badges', async ({ page }) => {
  await page.goto('/auth/signin')
  await page.fill('[name="email"]', 'free@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('/dashboard')
  
  // Check badges
  const crmBadge = page.locator('text=Team & CRM').locator('text=BUSINESS')
  await expect(crmBadge).toBeVisible()
  
  const wlBadge = page.locator('text=White Label').locator('text=AGENCY')
  await expect(wlBadge).toBeVisible()
})

test('BUSINESS user can access CRM', async ({ page }) => {
  // Login as business user
  await page.goto('/auth/signin')
  await page.fill('[name="email"]', 'business@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.click('text=Team & CRM')
  
  // Should not see upgrade prompt
  await expect(page.locator('text=Unlock Team & CRM')).not.toBeVisible()
  
  // Should see CRM dashboard
  await expect(page.locator('text=Total Customers')).toBeVisible()
})
```

---

## Troubleshooting

### Issue: Badges not showing

**Possible Causes:**
- `requiresPlan` not set in navigation array
- Crown icon import missing
- CSS classes not applied

**Solution:**
```typescript
// Verify navigation item has:
{ 
  name: 'Team & CRM', 
  requiresPlan: ['BUSINESS', 'AGENCY'],
  badge: 'BUSINESS' 
}
```

### Issue: Alert not firing

**Possible Causes:**
- `handleNavClick` not attached to Link
- `canAccessFeature` returning true incorrectly

**Solution:**
```typescript
// Verify Link has onClick:
<Link 
  href={item.href}
  onClick={(e) => handleNavClick(e, item)}
>
```

### Issue: Session API returns 401

**Possible Causes:**
- Not signed in
- Session expired
- Auth middleware not configured

**Solution:**
- Sign out and sign back in
- Check browser cookies
- Verify NextAuth configuration

### Issue: Redirect not working

**Possible Causes:**
- `useRouter` not imported
- Router.push() failing silently

**Solution:**
```typescript
import { useRouter } from 'next/navigation' // NOT 'next/router'

const router = useRouter()
router.push('/dashboard/billing?upgrade=business')
```

---

## Sign-Off Checklist

Before marking complete:

### Functionality
- [ ] FREE user sees all badges
- [ ] FREE user blocked from CRM
- [ ] FREE user blocked from White Label
- [ ] BUSINESS user accesses CRM
- [ ] BUSINESS user blocked from White Label
- [ ] AGENCY user accesses everything
- [ ] Upgrade prompts display correctly
- [ ] 3-second auto-redirect works

### Performance
- [ ] Page load < 2s
- [ ] Navigation response < 100ms
- [ ] No memory leaks
- [ ] No console errors

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus visible on all items
- [ ] Screen reader compatible
- [ ] Touch targets 44x44px minimum

### Mobile
- [ ] Responsive on iPhone
- [ ] Responsive on Android
- [ ] Badges don't overflow
- [ ] Buttons touch-friendly

### Security
- [ ] Server-side checks present
- [ ] API routes protected
- [ ] Unauthenticated access blocked
- [ ] Direct URL access handled

### Documentation
- [ ] [TIER_BASED_ACCESS_COMPLETE.md](./TIER_BASED_ACCESS_COMPLETE.md) reviewed
- [ ] [TIER_ACCESS_QUICK_REF.md](./TIER_ACCESS_QUICK_REF.md) reviewed
- [ ] [TIER_SYSTEM_ARCHITECTURE.md](./TIER_SYSTEM_ARCHITECTURE.md) reviewed
- [ ] This testing guide completed

---

## Test Results Log

| Test | Date | Tester | Result | Notes |
|------|------|--------|--------|-------|
| Test 1: FREE Nav | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 2: FREE Click CRM | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 3: FREE Direct URL | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 4: FREE White Label | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 5: BIZ CRM Access | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 6: BIZ White Label | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 7: AGENCY Full | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 8: Session API | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 9: Upgrade Flow | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 10: Mobile | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 11: Keyboard | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 12: Performance | ___ | ___ | ⬜ Pass / ⬜ Fail | |
| Test 13: Errors | ___ | ___ | ⬜ Pass / ⬜ Fail | |

---

## Post-Testing Actions

After all tests pass:

1. ✅ Commit changes to Git
2. ✅ Push to staging environment
3. ✅ Run tests again in staging
4. ✅ Get stakeholder approval
5. ✅ Deploy to production
6. ✅ Monitor error logs for 24 hours
7. ✅ Track upgrade conversion metrics

**Commands:**
```bash
git add .
git commit -m "feat: implement tier-based feature access with upgrade prompts"
git push origin main

# Deploy (adjust for your hosting)
vercel --prod
# or
npm run build && npm run start
```

---

## Success Criteria

This feature is considered **COMPLETE** when:

- ✅ All 13 tests pass
- ✅ Zero console errors in any scenario
- ✅ All accessibility checks pass
- ✅ Mobile responsiveness verified
- ✅ Performance benchmarks met
- ✅ Documentation reviewed and approved
- ✅ Stakeholder sign-off obtained

**Status:** 🟡 READY FOR TESTING
**Next Action:** Start Test 1 with FREE user
