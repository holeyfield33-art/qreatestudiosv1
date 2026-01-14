# ✅ Complete Testing Execution Plan

**Project:** Qreate Studios v1  
**Date:** January 14, 2026  
**Purpose:** Comprehensive pre-launch testing

---

## 📋 Testing Overview

This document provides a complete testing execution plan covering all features and user flows.

**Estimated Time:** 3-4 hours for complete testing

---

## 🧪 Test Environment Setup

### Prerequisites

```bash
# 1. Start development server
npm run dev

# 2. Open browser to http://localhost:3000
# 3. Have test credit cards ready:
#    - Success: 4242 4242 4242 4242
#    - Decline: 4000 0000 0000 0002
# 4. Have test email ready
# 5. Clear browser cache and cookies
```

---

## 1️⃣ Authentication & Authorization Tests

### Test 1.1: User Registration

**Steps:**
1. Navigate to `/auth/signup`
2. Enter:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. Click "Sign Up"

**Expected:**
- ✅ User created successfully
- ✅ Redirected to dashboard
- ✅ User logged in automatically
- ✅ Free tier assigned

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 1.2: User Login

**Steps:**
1. Sign out if logged in
2. Navigate to `/auth/signin`
3. Enter test credentials
4. Click "Sign In"

**Expected:**
- ✅ Successful login
- ✅ Redirected to dashboard
- ✅ Session persists on refresh

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 1.3: GitHub OAuth (Optional)

**Steps:**
1. Navigate to `/auth/signin`
2. Click "Sign in with GitHub"
3. Authorize application

**Expected:**
- ✅ OAuth flow completes
- ✅ User account created/linked
- ✅ Logged in successfully

**Status:** [ ] Pass [ ] Fail [ ] N/A  
**Notes:** _______________

---

### Test 1.4: Protected Routes

**Steps:**
1. Sign out
2. Try to access `/dashboard`
3. Try to access `/dashboard/qr-codes/create`

**Expected:**
- ✅ Redirected to sign-in page
- ✅ Callback URL preserved
- ✅ After login, redirected to original page

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 2️⃣ QR Code Creation Tests

### Test 2.1: Simple URL QR Code

**Steps:**
1. Navigate to `/dashboard/qr-codes/create`
2. Select "URL" type
3. Enter:
   - Name: `Test URL QR`
   - URL: `https://example.com`
   - Foreground: Red (#FF0000)
   - Background: White (#FFFFFF)
4. Click "Generate QR Code"
5. Preview appears
6. Click "Create QR Code"

**Expected:**
- ✅ QR code generated successfully
- ✅ Preview shows correctly
- ✅ Redirected to QR details page
- ✅ Can download QR code
- ✅ Short URL created

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 2.2: vCard QR Code

**Steps:**
1. Create new QR code
2. Select "vCard" type
3. Enter:
   - Name: `Test vCard`
   - First/Last Name
   - Phone number
   - Email
   - Organization
4. Generate and create

**Expected:**
- ✅ QR code created
- ✅ Scanning shows contact card
- ✅ All fields populate correctly

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 2.3: WiFi QR Code

**Steps:**
1. Create new QR code
2. Select "WiFi" type
3. Enter:
   - SSID: `TestNetwork`
   - Password: `TestPass123`
   - Security: WPA
4. Generate and create

**Expected:**
- ✅ QR code created
- ✅ Scanning connects to WiFi
- ✅ Credentials correct

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 2.4: Payment QR Code (Venmo)

**Steps:**
1. Create new QR code
2. Select "Payment" type
3. Select "Venmo"
4. Enter:
   - Username: `@testuser`
   - Amount: `25.00`
   - Note: `Test payment`
5. Generate and create

**Expected:**
- ✅ QR code created
- ✅ Scanning opens Venmo with pre-filled amount
- ✅ All details correct

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 2.5: Custom Logo Upload

**Steps:**
1. Create new QR code
2. Upload logo image
3. Adjust size/position
4. Generate

**Expected:**
- ✅ Logo uploads successfully
- ✅ Logo displays in QR center
- ✅ QR still scans correctly
- ✅ Image optimized/compressed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 2.6: QR Code Download Formats

**Steps:**
1. Open existing QR code
2. Try downloading as:
   - PNG
   - SVG
   - JPG

**Expected:**
- ✅ All formats download successfully
- ✅ Files have correct extensions
- ✅ Quality is high
- ✅ Transparent backgrounds work (PNG/SVG)

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 3️⃣ Analytics Tests

### Test 3.1: Scan Tracking

**Steps:**
1. Create a QR code
2. Get short URL
3. Scan QR code with phone (or visit short URL)
4. Check analytics dashboard
5. Wait 1 minute
6. Refresh analytics

**Expected:**
- ✅ Scan recorded immediately
- ✅ Device type detected
- ✅ Browser detected
- ✅ Location detected (if available)
- ✅ Count increments

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 3.2: Analytics Dashboard

**Steps:**
1. Navigate to `/dashboard/analytics`
2. View overview stats
3. Check individual QR analytics
4. Try date range filters

**Expected:**
- ✅ Total scans displayed
- ✅ Charts render correctly
- ✅ Date filters work
- ✅ Per-QR breakdown shown

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 3.3: Advanced Analytics (PRO+)

**Steps:**
1. Upgrade to PRO plan (or use test account)
2. Navigate to advanced analytics
3. View:
   - Device breakdown
   - Geographic heatmap
   - Time-based trends

**Expected:**
- ✅ Access granted for PRO users
- ✅ Access denied for FREE users
- ✅ Heatmap displays correctly
- ✅ All charts functional

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 3.4: Export Reports

**Steps:**
1. Open analytics for a QR code
2. Click "Export CSV"
3. Click "Export PDF"

**Expected:**
- ✅ CSV downloads with all data
- ✅ PDF generates correctly
- ✅ Data is accurate
- ✅ Formatting is correct

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 4️⃣ Landing Page Tests

### Test 4.1: Landing Page Creation

**Steps:**
1. Navigate to `/dashboard/landing-pages/create`
2. Select template (e.g., "Restaurant")
3. Enter:
   - Name: `Test Restaurant`
   - Slug: `test-restaurant`
4. Click "Create"

**Expected:**
- ✅ Page created successfully
- ✅ Redirected to builder
- ✅ Template loads correctly

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 4.2: Page Builder (Puck.js)

**Steps:**
1. In builder, drag sections:
   - Hero section
   - Menu section
   - Contact section
2. Edit content in each section
3. Change colors/images
4. Click "Save Draft"

**Expected:**
- ✅ Drag and drop works smoothly
- ✅ Sections can be edited
- ✅ Changes persist on save
- ✅ No errors in console

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 4.3: Menu Management

**Steps:**
1. In landing page, add menu
2. Create categories:
   - Appetizers
   - Main Course
   - Desserts
3. Add items to each category
4. Set prices and descriptions
5. Upload food images

**Expected:**
- ✅ Categories created
- ✅ Items added successfully
- ✅ Images upload and display
- ✅ Prices formatted correctly

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 4.4: Publish Landing Page

**Steps:**
1. Complete editing landing page
2. Click "Publish"
3. Visit public URL: `/l/test-restaurant`
4. Check on mobile device

**Expected:**
- ✅ Page publishes successfully
- ✅ Public URL accessible
- ✅ All content displays
- ✅ Responsive on mobile
- ✅ No draft content visible

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 4.5: QR to Landing Page Link

**Steps:**
1. Create QR code
2. Select "Landing Page" type
3. Link to published landing page
4. Generate QR code
5. Scan QR code

**Expected:**
- ✅ QR code links correctly
- ✅ Landing page opens on scan
- ✅ Table number parameter works (if used)
- ✅ Analytics track the source

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 5️⃣ Billing & Subscription Tests

### Test 5.1: View Pricing

**Steps:**
1. Navigate to `/pricing`
2. Review all tiers
3. Check feature lists

**Expected:**
- ✅ All 4 tiers displayed
- ✅ Prices correct
- ✅ Features listed accurately
- ✅ CTAs work

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 5.2: Upgrade to PRO

**Steps:**
1. Navigate to `/dashboard/billing`
2. Click "Upgrade to PRO"
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout

**Expected:**
- ✅ Stripe checkout loads
- ✅ Payment processes successfully
- ✅ Plan updates immediately
- ✅ New features unlocked
- ✅ Webhook received

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 5.3: Feature Access Enforcement

**Steps:**
1. As FREE user:
   - Try creating 4th QR code
   - Try accessing advanced analytics
   - Try using AI optimization
2. Verify denied access
3. Upgrade to PRO
4. Retry same actions

**Expected:**
- ✅ FREE users blocked correctly
- ✅ Upgrade prompts shown
- ✅ PRO users have full access
- ✅ Limits enforced accurately

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 5.4: Customer Portal

**Steps:**
1. Navigate to `/dashboard/billing`
2. Click "Manage Subscription"
3. Update payment method
4. View invoices
5. Cancel subscription (optional)

**Expected:**
- ✅ Portal opens correctly
- ✅ Can update card
- ✅ Invoices accessible
- ✅ Cancellation works if tested

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 6️⃣ AI Features Tests

### Test 6.1: AI QR Optimization

**Steps:**
1. Create a QR code
2. Navigate to optimization page
3. Click "Optimize with AI"
4. Review suggestions

**Expected:**
- ✅ AI generates suggestions
- ✅ Suggestions are relevant
- ✅ Can apply suggestions
- ✅ Credits deducted

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 6.2: AI Content Generation

**Steps:**
1. In landing page builder
2. Select content section
3. Click "Generate with AI"
4. Enter prompt: "Write about Italian cuisine"
5. Review generated content

**Expected:**
- ✅ Content generates quickly
- ✅ Quality is good
- ✅ Can edit before inserting
- ✅ Credits tracked

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 6.3: Link Security Check

**Steps:**
1. Navigate to AI tools
2. Enter suspicious URL
3. Run security check

**Expected:**
- ✅ Analysis completes
- ✅ Threat level shown
- ✅ Recommendations provided
- ✅ Safe links marked green

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 6.4: AI Credits

**Steps:**
1. Check AI credits dashboard
2. Use various AI features
3. Monitor credit usage
4. Check usage history

**Expected:**
- ✅ Credits display accurately
- ✅ Usage tracked correctly
- ✅ History shows all operations
- ✅ Costs calculated properly

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 7️⃣ White-Label Tests (AGENCY Plan)

### Test 7.1: Custom Branding

**Steps:**
1. Upgrade to AGENCY plan
2. Navigate to `/dashboard/white-label`
3. Upload logo
4. Set brand colors
5. Set custom text
6. Save branding

**Expected:**
- ✅ Logo uploads successfully
- ✅ Colors apply throughout app
- ✅ Custom text displays
- ✅ Changes persist

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 7.2: Custom Domain

**Steps:**
1. In white-label settings
2. Add custom domain
3. Configure DNS
4. Verify domain

**Expected:**
- ✅ Domain added successfully
- ✅ DNS instructions shown
- ✅ Verification works
- ✅ Site accessible on custom domain

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 7.3: Sub-Account Management

**Steps:**
1. Create sub-account
2. Set permissions
3. Login as sub-account
4. Verify limited access

**Expected:**
- ✅ Sub-account created
- ✅ Permissions apply correctly
- ✅ Can manage own QR codes
- ✅ Cannot access parent settings

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 8️⃣ NFC & Print Services

### Test 8.1: NFC Product Order

**Steps:**
1. Navigate to NFC products
2. Select product (e.g., NFC Card)
3. Choose quantity
4. Enter QR code link
5. Checkout with test card

**Expected:**
- ✅ Products displayed correctly
- ✅ Can select options
- ✅ Checkout completes
- ✅ Order tracked in dashboard

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 8.2: Print Order

**Steps:**
1. Navigate to print orders
2. Select QR code to print
3. Choose size and material
4. Set quantity
5. Place order

**Expected:**
- ✅ QR code previews correctly
- ✅ Options selectable
- ✅ Pricing calculates
- ✅ Order submits successfully

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 9️⃣ Security Tests

### Test 9.1: Anti-Phishing Detection

**Steps:**
1. Create QR code with suspicious URL
2. Check security report
3. View threat analysis

**Expected:**
- ✅ Suspicious link detected
- ✅ Warning displayed
- ✅ User can proceed with caution
- ✅ Report logged

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 9.2: Session Security

**Steps:**
1. Login
2. Check session in DB
3. Logout
4. Verify session cleared
5. Try accessing protected route

**Expected:**
- ✅ Session created on login
- ✅ Session cleared on logout
- ✅ Cannot access after logout
- ✅ Session expires after timeout

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 🔟 Mobile Responsiveness

### Test 10.1: Mobile Navigation

**Steps:**
1. Open site on mobile (or resize browser)
2. Test hamburger menu
3. Navigate to different pages
4. Test all dropdowns

**Expected:**
- ✅ Menu opens/closes smoothly
- ✅ All pages accessible
- ✅ Dropdowns work correctly
- ✅ No horizontal scroll

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 10.2: Mobile QR Creation

**Steps:**
1. Create QR code on mobile
2. Upload images
3. Preview QR code
4. Download QR code

**Expected:**
- ✅ Form works on mobile
- ✅ Image upload functional
- ✅ Preview displays correctly
- ✅ Download works

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

### Test 10.3: Mobile Landing Pages

**Steps:**
1. Visit landing page on mobile
2. Test menu scrolling
3. Test image loading
4. Test forms/CTAs

**Expected:**
- ✅ Page loads quickly
- ✅ Images optimized
- ✅ Touch targets adequate
- ✅ Forms work correctly

**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

---

## 📊 Test Summary

### Overall Results

- Total Tests: 35
- Passed: ____
- Failed: ____
- Skipped: ____

### Critical Issues Found

1. _______________
2. _______________
3. _______________

### Minor Issues Found

1. _______________
2. _______________
3. _______________

### Recommendations

1. _______________
2. _______________
3. _______________

---

## ✅ Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Environment:** [ ] Development [ ] Staging [ ] Production  
**Ready for Launch:** [ ] Yes [ ] No (see issues above)

---

**Last Updated:** January 14, 2026
