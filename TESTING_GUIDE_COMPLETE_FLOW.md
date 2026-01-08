# Testing Guide - QR → Landing Page → Menu → Print Flow

## Quick Test Checklist

### 1. Test QR Code Creation
```bash
# Navigate to: http://localhost:3000/dashboard/qr-codes/create

1. Fill in QR Code details:
   - Name: "Restaurant Menu QR"
   - Type: URL or Menu
   - URL: https://yourrestaurant.com

2. Click "Create QR Code"

3. ✅ SUCCESS MODAL SHOULD APPEAR with:
   - QR code preview
   - Download PNG button
   - Download SVG button
   - Copy short URL button
   - "Create Landing Page" button (primary)
   - "Order Physical Products" button
   - "View Details & Analytics" button
```

### 2. Test Landing Page Creation
```bash
# From Success Modal:

1. Click "Create Landing Page" button
2. You should be redirected to landing page editor
3. URL should include: ?qrId=xxx

4. ✅ CHECK FOR:
   - Three tabs: Design, Menu, Settings
   - Green banner: "✅ Connected to QR Code"
```

### 3. Test Menu Management
```bash
# In Landing Page Editor:

1. Click "Menu" tab
2. Click "Add Item" button
3. Fill in menu item:
   - Name: "Margherita Pizza"
   - Price: "12.99"
   - Description: "Fresh mozzarella, tomatoes, basil"
   - Category: "Entrees"

4. Click "Add Item" or "Update Item"

5. ✅ VERIFY:
   - Toast notification appears
   - Item shows up in the list
   - Price formatted as $12.99
   - Grouped under "Entrees" category

6. Test Edit:
   - Click edit icon on an item
   - Modify fields
   - Click "Update Item"
   - ✅ Changes should save

7. Test Delete:
   - Click delete icon
   - Confirm deletion
   - ✅ Item should be removed
```

### 4. Test Complete Flow
```bash
# Full Restaurant Scenario:

1. Create QR Code for restaurant menu
2. Click "Create Landing Page" from success modal
3. Add multiple menu items:
   
   APPETIZERS:
   - Bruschetta - $8.99
   - Calamari - $11.99
   
   ENTREES:
   - Margherita Pizza - $12.99
   - Spaghetti Carbonara - $14.99
   - Chicken Parmigiana - $16.99
   
   DESSERTS:
   - Tiramisu - $7.99
   - Panna Cotta - $6.99
   
   DRINKS:
   - House Wine - $8.00
   - Espresso - $3.50

4. Switch to "Design" tab
   - Update page title
   - Toggle "Published" switch

5. Click "Publish" button

6. ✅ VERIFY:
   - Success modal appears
   - "View live page" link works
   - Landing page shows all menu items
   - Items grouped by category

7. Test Print Order:
   - From QR success modal or landing page
   - Click "Order Physical Products"
   - ✅ Should redirect to print shop with qrId
```

## API Testing

### Test Menu API Endpoints

```bash
# GET Menu Items
curl http://localhost:3000/api/landing-pages/{landingPageId}/menu

# Expected Response:
{
  "menuItems": [
    {
      "id": "xxx",
      "name": "Margherita Pizza",
      "price": 12.99,
      "category": "Entrees",
      "description": "Fresh mozzarella...",
      "available": true,
      "order": 0
    }
  ]
}

# POST New Menu Item
curl -X POST http://localhost:3000/api/landing-pages/{landingPageId}/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caesar Salad",
    "price": "9.99",
    "description": "Romaine lettuce, parmesan, croutons",
    "category": "Appetizers"
  }'

# PATCH Update Menu Item
curl -X PATCH http://localhost:3000/api/landing-pages/{landingPageId}/menu/{itemId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caesar Salad",
    "price": "10.99"
  }'

# DELETE Menu Item
curl -X DELETE http://localhost:3000/api/landing-pages/{landingPageId}/menu/{itemId}
```

## Database Verification

```sql
-- Check LandingPageMenuItem table exists
SELECT * FROM "LandingPageMenuItem" LIMIT 5;

-- Verify menu items for a landing page
SELECT 
  id, 
  name, 
  price, 
  category,
  "landingPageId"
FROM "LandingPageMenuItem"
WHERE "landingPageId" = 'your-landing-page-id'
ORDER BY category, "order";

-- Check landing page relation
SELECT 
  lp.name as page_name,
  COUNT(lpm.id) as menu_item_count
FROM "LandingPage" lp
LEFT JOIN "LandingPageMenuItem" lpm ON lpm."landingPageId" = lp.id
GROUP BY lp.id, lp.name;
```

## Expected Behavior

### Success Criteria

✅ **QR Code Creation**
- Modal appears with all buttons
- Downloads work (PNG/SVG)
- Short URL copies correctly
- Buttons redirect to correct pages

✅ **Landing Page Editor**
- Tabs render correctly
- QR connection banner shows when qrId present
- All three tabs (Design, Menu, Settings) functional

✅ **Menu Management**
- Can add unlimited items
- CRUD operations work
- Items group by category
- Price formatting correct
- Real-time updates

✅ **Database**
- LandingPageMenuItem table exists
- Relations work correctly
- Cascade deletes function
- Indexes present

✅ **Complete Flow**
- QR → Landing Page (with qrId)
- Landing Page → Menu Management
- Menu → Publish
- Publish → Print Order

## Common Issues & Solutions

### Issue: "Property 'landingPageMenuItem' does not exist"
**Solution:** TypeScript cache issue. Run:
```bash
npx prisma generate
# Restart VS Code TypeScript server
# Or restart dev server
```

### Issue: Menu items not saving
**Solution:** Check:
1. Authentication working (logged in)
2. Landing page ID is correct
3. Network tab shows successful POST
4. Database connection active

### Issue: QR connection banner not showing
**Solution:** Ensure:
1. URL has ?qrId=xxx parameter
2. useSearchParams() hook working
3. Check browser console for errors

### Issue: Categories not grouping
**Solution:** Verify:
1. Category field has exact match (case-sensitive)
2. Check predefined categories list
3. Frontend grouping logic working

## Performance Testing

```bash
# Test with many menu items
# Add 50+ items across categories
# Verify:
- Page loads quickly
- Scrolling is smooth
- Search/filter works (if implemented)
- No memory leaks

# Test concurrent operations
# Multiple users editing menu simultaneously
# Verify:
- No race conditions
- Proper locking/transactions
- Data consistency
```

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS & macOS)
- ✅ Mobile browsers

## Mobile Testing

```bash
# Scan QR code with phone camera
# Navigate through flow on mobile
# Verify:
- Responsive design
- Touch interactions
- Modal displays correctly
- Forms usable on small screens
```

---

## Automated Testing (Future)

```typescript
// Example E2E test with Playwright/Cypress
describe('QR to Landing Page Flow', () => {
  it('should create QR, add menu items, and publish', async () => {
    // Create QR
    await page.goto('/dashboard/qr-codes/create');
    await page.fill('[name="name"]', 'Test Menu QR');
    await page.click('button[type="submit"]');
    
    // Success modal should appear
    await page.waitForSelector('.success-modal');
    
    // Create landing page
    await page.click('text=Create Landing Page');
    
    // Add menu item
    await page.click('text=Menu');
    await page.click('text=Add Item');
    await page.fill('[name="name"]', 'Pizza');
    await page.fill('[name="price"]', '12.99');
    await page.click('button:has-text("Add Item")');
    
    // Verify item appears
    await page.waitForSelector('text=Pizza');
    await page.waitForSelector('text=$12.99');
  });
});
```

---

**Ready to test? Start with step 1 and work through the checklist!** 🚀
