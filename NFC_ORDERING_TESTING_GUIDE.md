# NFC Ordering System - Testing Guide

## 🧪 Complete System Testing Checklist

### Prerequisites
- [ ] Application running (`npm run dev`)
- [ ] Database connected and migrated
- [ ] Stripe keys configured in `.env`
- [ ] Resend API key configured for emails
- [ ] User account created and logged in

---

## 📋 Test Scenarios

### **Scenario 1: Customer Order Flow (Happy Path)**

#### Step 1: Create Test QR Code
1. Navigate to `/dashboard/qr-codes`
2. Click "Create QR Code"
3. Select any QR type (URL works fine)
4. Fill in required fields
5. Click "Create"
6. **Expected:** QR code created successfully

#### Step 2: Access NFC Order Page
1. Click on the newly created QR code
2. Scroll to the download section
3. Look for **"Get Physical NFC Card/Sticker"** button (animated gradient)
4. Click the button
5. **Expected:** Navigate to `/dashboard/qr-codes/[id]/order-nfc`

#### Step 3: Select Products
1. View 4 product options:
   - ✅ NFC Business Card (Blank White) - $4.99
   - ✅ NFC Card + Custom Sticker Overlay - $6.99 (requires design upload)
   - ✅ NFC Stickers - 10 Pack - $14.99
   - ✅ NFC Stickers - 50 Pack - $59.99
2. Click **"Add to Cart"** on at least one product
3. Adjust quantity using +/- buttons
4. **Expected:** Cart updates with correct subtotal

#### Step 4: Upload Custom Design (Optional)
1. If using Custom Card, click **"Upload Design"**
2. Select an image file (PNG, JPG, or PDF)
3. **Expected:** File name displayed, upload icon changes to checkmark

#### Step 5: Review Cart
1. Check subtotal calculation
2. Check shipping cost:
   - **$0.00** if subtotal ≥ $15
   - **$2.99** if subtotal < $15
3. Check total = subtotal + shipping
4. **Expected:** All calculations correct

#### Step 6: Proceed to Checkout
1. Click **"Proceed to Checkout"** button
2. **Expected:** Redirect to Stripe Checkout page
3. **Expected:** Line items match cart
4. **Expected:** Shipping address form displayed

#### Step 7: Complete Payment (Test Mode)
1. Enter test card details:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
2. Enter shipping address:
   ```
   Name: Test Customer
   Address Line 1: 123 Test Street
   City: San Francisco
   State: CA
   ZIP: 94102
   Country: United States
   ```
3. Click **"Pay"**
4. **Expected:** Payment successful
5. **Expected:** Redirect to success page

#### Step 8: Verify Emails
1. Check admin email inbox (from Resend dashboard)
   - **Subject:** "New NFC Order #[ORDER_NUMBER] - Ready to Fulfill"
   - **Content:**
     - Order number and date
     - **Encode URL** (large, bold)
     - Product list with quantities
     - Shipping address (formatted)
     - Customer email/phone
2. Check customer email inbox
   - **Subject:** "Your NFC Order #[ORDER_NUMBER] is Confirmed!"
   - **Content:**
     - Order confirmation
     - Product details
     - Shipping address
     - Estimated delivery: 2 business days

---

### **Scenario 2: Admin Fulfillment Flow**

#### Step 1: Access Admin Panel
1. Navigate to `/dashboard/orders`
2. Click **"NFC Orders"** tab
3. **Expected:** See list of NFC orders
4. **Expected:** New order appears at top

#### Step 2: View Order Details
1. Locate the test order from Scenario 1
2. Verify displayed information:
   - ✅ Order number
   - ✅ Date/time
   - ✅ Status badge (should be "paid")
   - ✅ Total price
   - ✅ Customer name
3. **Expected:** All details correct

#### Step 3: Copy Encode URL
1. Find the blue-highlighted **"ENCODE URL"** section
2. Click the **Copy** button
3. Paste into browser or text editor
4. **Expected:** Correct short URL (e.g., `https://qreatestudios.com/abc123`)

#### Step 4: View Products
1. Check the **"PRODUCTS"** section
2. Verify quantities and product names
3. If custom design, click **"View Design"** link
4. **Expected:** Products match order
5. **Expected:** Design file opens in new tab

#### Step 5: Copy Shipping Address
1. Find the **"SHIP TO"** section
2. Click **"Copy Address"** button
3. Paste into text editor
4. **Expected:** Formatted address with line breaks

#### Step 6: Update Status to Encoding
1. Click **"Mark as Encoding"** button
2. **Expected:** Status badge updates to "encoding" (yellow)
3. **Expected:** Toast notification appears
4. **Expected:** Order re-renders with new status

#### Step 7: Update Status to Encoded
1. Click **"Mark as Encoded"** button
2. **Expected:** Status badge updates to "encoded" (purple)
3. **Expected:** Toast notification appears

#### Step 8: Mark as Shipped
1. Click **"Mark as Shipped"** button
2. **Expected:** Modal dialog opens
3. Enter tracking number: `1Z999AA10123456784`
4. Click **"Mark as Shipped"**
5. **Expected:** Modal closes
6. **Expected:** Status badge updates to "shipped" (green)
7. **Expected:** Tracking number displays in order card

#### Step 9: Verify Shipping Email
1. Check customer email inbox
   - **Subject:** "Your NFC Order #[ORDER_NUMBER] Has Shipped! 📦"
   - **Content:**
     - Shipping confirmation
     - **Tracking number** (large, bold)
     - Shipping address
     - Estimated delivery: 3-5 business days

---

### **Scenario 3: Search & Filter**

#### Test Search
1. In search box, enter:
   - Order number → **Expected:** Matching order found
   - Customer name → **Expected:** Matching order found
   - Customer email → **Expected:** Matching order found
   - Random text → **Expected:** No results message

#### Test Status Filter
1. Click status dropdown
2. Select **"Paid"** → **Expected:** Only paid orders shown
3. Select **"Encoding"** → **Expected:** Only encoding orders shown
4. Select **"Shipped"** → **Expected:** Only shipped orders shown
5. Select **"All Statuses"** → **Expected:** All orders shown

---

### **Scenario 4: Multiple Products Order**

1. Create new QR code
2. Navigate to NFC order page
3. Add **2x Blank Cards** ($4.99 each)
4. Add **1x 10-Pack Stickers** ($14.99)
5. **Expected Cart:**
   ```
   Subtotal: $24.97
   Shipping: FREE (over $15)
   Total: $24.97
   ```
6. Complete checkout
7. Verify admin panel shows all 3 items
8. **Expected:** Products listed correctly with quantities

---

### **Scenario 5: Custom Design Upload**

1. Create new QR code
2. Navigate to NFC order page
3. Select **"NFC Card + Custom Sticker Overlay"**
4. Click **"Upload Design"**
5. Upload test image (PNG/JPG)
6. **Expected:** File name displayed
7. **Expected:** Upload button shows checkmark
8. Add to cart
9. Complete checkout
10. In admin panel, click **"View Design"**
11. **Expected:** Image opens in new tab

---

### **Scenario 6: Shipping Cost Calculation**

#### Test A: Under $15 (Shipping = $2.99)
1. Add 1x Blank Card ($4.99)
2. **Expected:**
   ```
   Subtotal: $4.99
   Shipping: $2.99
   Total: $7.98
   ```

#### Test B: Exactly $15 (Free Shipping)
1. Add 3x Blank Card ($14.97) + adjust prices to hit $15
2. **Expected:**
   ```
   Subtotal: $15.00
   Shipping: FREE
   Total: $15.00
   ```

#### Test C: Over $15 (Free Shipping)
1. Add 1x 10-Pack Stickers ($14.99)
2. **Expected:**
   ```
   Subtotal: $14.99
   Shipping: FREE
   Total: $14.99
   ```

---

### **Scenario 7: Error Handling**

#### Test Missing QR Code
1. Navigate to `/dashboard/qr-codes/invalid-id/order-nfc`
2. **Expected:** Error message or redirect

#### Test Checkout Without Cart Items
1. Navigate to order page
2. Click **"Proceed to Checkout"** without adding items
3. **Expected:** Toast error "Cart is empty"

#### Test Non-Admin Access
1. Create non-admin user account
2. Navigate to `/dashboard/orders`
3. Try to access `/api/admin/orders/nfc`
4. **Expected:** 403 Forbidden error

#### Test Invalid Status Update
1. As admin, try to update order with invalid status
2. **Expected:** 400 Bad Request error

---

## 🔍 What to Check

### UI/UX Validation
- [ ] All buttons have hover states
- [ ] Loading states display during API calls
- [ ] Toast notifications appear for all actions
- [ ] Images load correctly (placeholder URLs)
- [ ] Responsive design on mobile
- [ ] Status badges have correct colors
- [ ] Forms validate before submission
- [ ] Icons align properly with text

### Data Validation
- [ ] Order numbers are unique
- [ ] Prices calculate correctly
- [ ] Quantities update properly
- [ ] Shipping logic works (free at $15+)
- [ ] Order statuses update in database
- [ ] Tracking numbers save correctly
- [ ] Custom design URLs persist

### Email Validation
- [ ] Admin fulfillment email sends on payment
- [ ] Customer confirmation email sends on payment
- [ ] Customer shipping email sends on shipped status
- [ ] Encode URL is bold/large in admin email
- [ ] All emails have correct formatting
- [ ] Unsubscribe links work (if applicable)

### Security Validation
- [ ] Non-logged-in users can't access order pages
- [ ] Users can only order for their own QR codes
- [ ] Admin endpoints require ADMIN role
- [ ] Stripe webhooks validate signatures
- [ ] File uploads are validated (type, size)
- [ ] SQL injection not possible

---

## 🐛 Common Issues & Solutions

### Issue: Stripe checkout fails
**Solution:** Check `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`

### Issue: Emails not sending
**Solution:** Verify `RESEND_API_KEY` is correct and domain is verified in Resend

### Issue: Webhook not triggering
**Solution:** 
1. Check webhook endpoint in Stripe dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` matches
3. Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` for local testing

### Issue: Order not appearing in admin panel
**Solution:**
1. Check `productType='nfc'` in database
2. Verify user has ADMIN role
3. Check database connection

### Issue: Image upload fails
**Solution:** Verify file upload service is configured (Uploadthing, S3, etc.)

### Issue: Status update doesn't persist
**Solution:** Check console for API errors, verify order ID is correct

---

## 📊 Database Checks

After completing tests, verify in database:

```sql
-- Check order was created
SELECT * FROM "PrintOrder" WHERE "productType" = 'nfc' ORDER BY "createdAt" DESC LIMIT 5;

-- Check order specifications
SELECT "orderNumber", "specifications", "shippingAddress" FROM "PrintOrder" WHERE "productType" = 'nfc';

-- Check status history
SELECT "orderNumber", "status", "updatedAt" FROM "PrintOrder" WHERE "productType" = 'nfc' ORDER BY "updatedAt" DESC;

-- Check tracking numbers
SELECT "orderNumber", "trackingNumber", "shippedAt" FROM "PrintOrder" WHERE "trackingNumber" IS NOT NULL;
```

---

## ✅ Final Checklist

Before deploying to production:

- [ ] All test scenarios pass
- [ ] No console errors in browser
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables set in production
- [ ] Stripe webhook configured for production domain
- [ ] Email domain verified in Resend
- [ ] Admin user role assigned
- [ ] Database migrations run
- [ ] Backup created before deployment
- [ ] Monitoring/logging configured

---

## 🎯 Performance Tests

- [ ] Order page loads in < 2 seconds
- [ ] Checkout redirect happens in < 3 seconds
- [ ] Admin panel loads orders in < 1 second
- [ ] Status updates complete in < 500ms
- [ ] Emails send within 30 seconds of event

---

## 📞 Support Contacts

If issues persist:
- **Stripe Support:** dashboard.stripe.com/support
- **Resend Support:** resend.com/support
- **Application Logs:** Check server console and browser console

---

**Testing Version:** 1.0.0  
**Last Updated:** January 5, 2026  
**Status:** ✅ Ready for Testing
