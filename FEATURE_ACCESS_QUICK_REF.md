# Feature Access Quick Reference

## Import Statements

```typescript
// Server-side (Server Components, API routes, Server Actions)
import { getServerFeatureAccess, enforceFeatureAccess, checkFeatureAccess } from '@/lib/utils/feature-access-server';

// Client-side (Client Components)
import { useFeatureAccess, useHasFeature, usePlan } from '@/lib/hooks/use-feature-access';

// Utility functions (both server and client)
import { getFeatureAccess, hasFeatureAccess, getFeatureLimit, isWithinLimit } from '@/lib/utils/feature-access';
```

## Common Patterns

### Server Component
```typescript
export default async function Page() {
  const { features, plan, hasFeature } = await getServerFeatureAccess();
  
  return (
    <div>
      {features.canAccessWhiteLabel && <WhiteLabelSection />}
    </div>
  );
}
```

### Client Component
```typescript
'use client';

export default function Component() {
  const { features, plan, hasFeature, isLoading } = useFeatureAccess();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {features.canUseAIOptimization && <AIButton />}
    </div>
  );
}
```

### API Route
```typescript
export async function POST(req: Request) {
  try {
    await enforceFeatureAccess('canExportReports');
    // Feature logic
  } catch (error) {
    return Response.json({ error: error.message }, { status: 403 });
  }
}
```

### Server Action
```typescript
'use server';

export async function myAction() {
  const { features } = await getServerFeatureAccess();
  
  if (!features.canUseAIOptimization) {
    return { error: 'Feature not available' };
  }
  
  // Action logic
}
```

## Feature Flags

| Feature Flag | FREE | PRO | BUSINESS | AGENCY |
|-------------|------|-----|----------|--------|
| `canAccessAdvancedAnalytics` | ❌ | ✅ | ✅ | ✅ |
| `canExportReports` | ❌ | ✅ | ✅ | ✅ |
| `canAccessTemplates` | ✅ | ✅ | ✅ | ✅ |
| `canAccessPremiumTemplates` | ❌ | ❌ | ✅ | ✅ |
| `canAccessWhiteLabel` | ❌ | ❌ | ❌ | ✅ |
| `canUseCustomDomain` | ❌ | ❌ | ❌ | ✅ |
| `canManageSubAccounts` | ❌ | ❌ | ❌ | ✅ |
| `canUseAIOptimization` | ❌ | ✅ | ✅ | ✅ |
| `maxQRCodes` | 3 | 50 | ∞ | ∞ |
| `maxTeamSeats` | 1 | 1 | 5 | ∞ |

## SQL Commands

```sql
-- View current plan
SELECT "id", "name", "plan" FROM "Organization" WHERE "id" = 'org_id';

-- Set plan to FREE
UPDATE "Organization" SET "plan" = 'FREE' WHERE "id" = 'org_id';

-- Upgrade to PRO
UPDATE "Organization" SET "plan" = 'PRO' WHERE "id" = 'org_id';

-- Upgrade to BUSINESS
UPDATE "Organization" SET "plan" = 'BUSINESS' WHERE "id" = 'org_id';

-- Upgrade to AGENCY (with white-label)
UPDATE "Organization" SET "plan" = 'AGENCY', "isWhiteLabel" = true WHERE "id" = 'org_id';

-- Count organizations by plan
SELECT "plan", COUNT(*) FROM "Organization" GROUP BY "plan";
```

## Quick Checks

### Check Single Feature
```typescript
// Server
const hasFeature = await checkFeatureAccess('canExportReports');

// Client
const hasFeature = useHasFeature('canExportReports');
```

### Check Limit
```typescript
const { features } = await getServerFeatureAccess();
const canCreateMore = features.maxQRCodes === -1 || currentCount < features.maxQRCodes;
```

### Get Current Plan
```typescript
// Server
const { plan } = await getServerFeatureAccess();

// Client
const plan = usePlan();
```

## Button States

```typescript
// Disabled for users without access
<Button disabled={!features.canUseAIOptimization}>
  {features.canUseAIOptimization ? 'AI Optimize' : 'AI Optimize (PRO Required)'}
</Button>

// Hidden for users without access
{features.canAccessWhiteLabel && (
  <Button>White-Label Settings</Button>
)}

// With badge
<Button disabled={!features.canExportReports}>
  Export
  {!features.canExportReports && <Badge>PRO</Badge>}
</Button>
```

## Error Messages

```typescript
// Feature not available
"This feature requires PRO plan or higher"

// Limit reached
"QR code limit reached (50). Upgrade to BUSINESS for unlimited."

// No access
"Unauthorized: Feature 'canAccessWhiteLabel' requires AGENCY plan"
```

## Navigation

```typescript
// In dashboard-nav.tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'White-Label', href: '/dashboard/white-label', icon: Palette, requiresWhiteLabel: true },
];

// Filter based on features
const { features } = await getServerFeatureAccess();
const visibleNav = navigation.filter(item => 
  !item.requiresWhiteLabel || features.canAccessWhiteLabel
);
```

## Testing Locally

1. **Set organization plan in database**:
   ```sql
   UPDATE "Organization" SET "plan" = 'AGENCY' WHERE "id" = 'your_org_id';
   ```

2. **Sign out and sign back in** (to refresh JWT token)

3. **Verify features are visible/enabled**

## Common Gotchas

❌ **Don't** check features only on client
```typescript
// BAD - can be bypassed
if (features.canExportReports) {
  exportReport(); // Client controls this
}
```

✅ **Do** validate on server
```typescript
// GOOD - server validates
await enforceFeatureAccess('canExportReports');
exportReport();
```

❌ **Don't** forget to check limits
```typescript
// BAD - might exceed limit
await createQRCode();
```

✅ **Do** validate limits first
```typescript
// GOOD - checks limit
if (!isWithinLimit(plan, 'maxQRCodes', currentCount)) {
  throw new Error('Limit reached');
}
await createQRCode();
```

## Files

- `lib/utils/feature-access.ts` - Core utility
- `lib/utils/feature-access-server.ts` - Server helpers
- `lib/hooks/use-feature-access.ts` - Client hooks
- `lib/examples/feature-access-usage.tsx` - Usage examples
- `components/layout/dashboard-nav.tsx` - Navigation integration
- `auth.ts` - Session includes plan
- `prisma/schema.prisma` - Organization.plan field

## Support

See full documentation: `PLAN_BASED_FEATURE_ACCESS.md`
