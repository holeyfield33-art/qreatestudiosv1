# Tier-Based Access - Quick Reference

## Plan Tiers

| Plan | Price | QR Codes | Landing Pages | Special Features |
|------|-------|----------|---------------|------------------|
| **FREE** | $0 | 5 | 1 | Basic features only |
| **PRO** | $15/mo | 100 | 10 | AI tools, analytics |
| **BUSINESS** | $49/mo | 500 | Unlimited | **Team & CRM** (5 members) |
| **AGENCY** | $149/mo | Unlimited | Unlimited | **White Label** + Sub-accounts |

## Navigation Items by Tier

### All Users (FREE, PRO, BUSINESS, AGENCY)
1. Dashboard
2. QR Codes
3. Landing Pages
4. Analytics
5. Print Shop
6. Billing
7. Settings

### Business+ Users (BUSINESS, AGENCY)
8. Team & CRM 🔒 (shows BUSINESS badge for FREE/PRO)

### Agency Users (AGENCY only)
9. White Label 🔒 (shows AGENCY badge for FREE/PRO/BUSINESS)

## Feature Access Check

```typescript
// Get user plan
const userPlan = user?.plan || user?.organization?.plan || 'FREE'

// Check access
const canAccessCRM = ['BUSINESS', 'AGENCY'].includes(userPlan)
const canAccessWhiteLabel = ['AGENCY'].includes(userPlan)
```

## Testing Different Plans

### Test as FREE User
1. All nav items visible
2. CRM shows "BUSINESS" badge (locked)
3. White Label shows "AGENCY" badge (locked)
4. Clicking locked items → alert → redirect to billing

### Test as BUSINESS User
1. All nav items visible
2. CRM accessible (no badge)
3. White Label shows "AGENCY" badge (locked)
4. Can access Team & CRM page

### Test as AGENCY User
1. All nav items visible
2. No badges on any items (full access)
3. Can access Team & CRM page
4. Can access White Label settings

## Key Files

| File | Purpose |
|------|---------|
| `/components/layout/dashboard-nav.tsx` | Navigation with tier logic |
| `/app/dashboard/crm/page.tsx` | CRM page (Business+) |
| `/app/dashboard/white-label/page.tsx` | White Label page (Agency) |
| `/app/dashboard/billing/page.tsx` | Billing page (all users) |
| `/app/api/user/session/route.ts` | Session API with plan |
| `/types/next-auth.d.ts` | TypeScript types |

## Upgrade Flow

```mermaid
User clicks locked feature
    ↓
Alert displays requirement
    ↓
Redirects to /dashboard/billing?upgrade=business
    ↓
User sees plan comparison
    ↓
Clicks "Upgrade to Business"
    ↓
Stripe checkout session
    ↓
Payment success
    ↓
Organization.plan updated
    ↓
User gains access to feature
```

## API Endpoints

```bash
# Get current session with plan
GET /api/user/session
Response: { success: true, user: { id, email, name, plan, organization } }

# Get subscription status
GET /api/user/subscription
Response: { success: true, subscription: { plan, status, currentPeriodEnd } }

# Create checkout session
POST /api/billing/checkout
Body: { plan: "BUSINESS" }
Response: { success: true, url: "https://checkout.stripe.com/..." }
```

## Upgrade Prompt Component

```tsx
// Show upgrade prompt for locked feature
if (userPlan !== 'BUSINESS' && userPlan !== 'AGENCY') {
  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5">
      <CardHeader className="text-center">
        <Crown className="h-8 w-8 text-white" />
        <CardTitle>Unlock Team & CRM Features</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push('/dashboard/billing?upgrade=business')}>
          Upgrade to Business →
        </Button>
      </CardContent>
    </Card>
  )
}
```

## Badge Styling

```tsx
// Crown badge for locked features
{isLocked && item.badge && (
  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full 
    bg-gradient-to-r from-purple-500/20 to-pink-500/20 
    text-xs font-semibold text-purple-400">
    <Crown className="h-3 w-3" />
    {item.badge}
  </span>
)}
```

## Common Issues

### Issue: User upgraded but still sees locked features
**Solution:** Session not updated. Have user sign out and sign back in.

### Issue: Badge not showing on locked items
**Solution:** Check that `requiresPlan` array is set in navigation config.

### Issue: Alert not firing on click
**Solution:** Verify `handleNavClick` is attached to Link onClick handler.

### Issue: Redirect not working
**Solution:** Check that `useRouter` is imported from 'next/navigation'.

## Development Commands

```bash
# Start dev server
npm run dev

# Check types
npx tsc --noEmit

# Check for errors
npm run lint

# Build for production
npm run build
```

## Testing Checklist

- [ ] FREE user sees badges on CRM and White Label
- [ ] Clicking locked item shows alert
- [ ] Alert redirects to billing page
- [ ] Billing page shows upgrade option for clicked plan
- [ ] BUSINESS user can access CRM without prompt
- [ ] AGENCY user can access all features
- [ ] User plan displays in navigation footer
- [ ] Session API returns correct plan
- [ ] Upgrade flow completes successfully

## Support

If issues persist:
1. Check browser console for errors
2. Verify session data in `/api/user/session`
3. Confirm organization.plan in database
4. Check Stripe webhook logs for plan updates
5. Review [TIER_BASED_ACCESS_COMPLETE.md](./TIER_BASED_ACCESS_COMPLETE.md)
