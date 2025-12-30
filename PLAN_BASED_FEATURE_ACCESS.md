# Plan-Based Feature Access System

## Overview
Comprehensive plan-based feature access control system that manages what features users can access based on their organization's subscription plan (FREE, PRO, BUSINESS, AGENCY).

## Implementation

### 1. Feature Access Utility
**File**: `lib/utils/feature-access.ts`

Centralized feature access logic with helper functions:
- `getFeatureAccess(plan)` - Get all features for a plan
- `hasFeatureAccess(plan, feature)` - Check specific feature access
- `getFeatureLimit(plan, limitType)` - Get numeric limits (QR codes, team seats)
- `isWithinLimit(plan, limitType, count)` - Validate against limits

### 2. Database Schema
**Updated**: `prisma/schema.prisma`

Added `plan` field to Organization model:
```prisma
model Organization {
  plan String @default("FREE") // FREE, PRO, BUSINESS, AGENCY
  // ... other fields
}
```

**Migration**: `20251230191652_add_organization_plan`

### 3. Authentication Integration
**Updated**: `auth.ts`

- JWT includes organization plan
- Session includes organization plan
- Automatic plan lookup on sign-in

### 4. TypeScript Types
**Updated**: `types/next-auth.d.ts`

Session and JWT types include:
```typescript
organization?: {
  id: string
  plan: string
  isWhiteLabel: boolean
}
```

### 5. Navigation Component
**Updated**: `components/layout/dashboard-nav.tsx`

- Uses `getFeatureAccess()` to determine visibility
- White-Label item shown only for AGENCY plan
- Extensible for more conditional nav items

## Plan Features Matrix

| Feature | FREE | PRO | BUSINESS | AGENCY |
|---------|------|-----|----------|--------|
| **Analytics** |
| Advanced Analytics | ❌ | ✅ | ✅ | ✅ |
| Export Reports | ❌ | ✅ | ✅ | ✅ |
| **Templates** |
| Basic Templates | ✅ | ✅ | ✅ | ✅ |
| Premium Templates | ❌ | ❌ | ✅ | ✅ |
| **White-Label** |
| White-Label Access | ❌ | ❌ | ❌ | ✅ |
| Custom Domain | ❌ | ❌ | ❌ | ✅ |
| Sub-Accounts | ❌ | ❌ | ❌ | ✅ |
| **AI Features** |
| AI Optimization | ❌ | ✅ | ✅ | ✅ |
| **Limits** |
| Max QR Codes | 3 | 50 | ∞ | ∞ |
| Max Team Seats | 1 | 1 | 5 | ∞ |

## Usage Examples

### Check Feature Access in Components

```typescript
import { getFeatureAccess } from '@/lib/utils/feature-access';

export default function MyComponent({ user }) {
  const plan = user.organization?.plan || 'FREE';
  const features = getFeatureAccess(plan);
  
  return (
    <div>
      {features.canAccessAdvancedAnalytics && (
        <AdvancedAnalyticsSection />
      )}
      
      {features.canAccessWhiteLabel && (
        <WhiteLabelSettings />
      )}
      
      {features.canUseAIOptimization && (
        <AIOptimizeButton />
      )}
    </div>
  );
}
```

### Check Limits Before Actions

```typescript
import { isWithinLimit } from '@/lib/utils/feature-access';

async function createQRCode(userId: string) {
  const user = await getUser(userId);
  const plan = user.organization?.plan || 'FREE';
  const currentQRCount = await countUserQRCodes(userId);
  
  if (!isWithinLimit(plan, 'maxQRCodes', currentQRCount)) {
    throw new Error('QR code limit reached. Upgrade your plan.');
  }
  
  // Create QR code
}
```

### API Route Protection

```typescript
import { auth } from '@/auth';
import { hasFeatureAccess } from '@/lib/utils/feature-access';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const plan = session.user.organization?.plan || 'FREE';
  
  if (!hasFeatureAccess(plan, 'canExportReports')) {
    return Response.json(
      { error: 'This feature requires PRO plan or higher' },
      { status: 403 }
    );
  }
  
  // Export report logic
}
```

### Client-Side Feature Checks

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { getFeatureAccess } from '@/lib/utils/feature-access';

export default function FeatureButton() {
  const { data: session } = useSession();
  const plan = session?.user?.organization?.plan || 'FREE';
  const features = getFeatureAccess(plan);
  
  if (!features.canUseAIOptimization) {
    return (
      <Button disabled>
        AI Optimize (PRO Required)
      </Button>
    );
  }
  
  return <Button>AI Optimize</Button>;
}
```

## Database Operations

### Set Organization Plan

```sql
-- Upgrade to PRO
UPDATE "Organization" 
SET "plan" = 'PRO' 
WHERE "id" = 'org_id';

-- Upgrade to AGENCY (includes white-label)
UPDATE "Organization" 
SET "plan" = 'AGENCY',
    "isWhiteLabel" = true
WHERE "id" = 'org_id';
```

### Query Organizations by Plan

```sql
-- Get all AGENCY plan organizations
SELECT * FROM "Organization" WHERE "plan" = 'AGENCY';

-- Get organizations with AI access
SELECT * FROM "Organization" 
WHERE "plan" IN ('PRO', 'BUSINESS', 'AGENCY');
```

## Adding New Features

### 1. Update FeatureAccess Interface

```typescript
export interface FeatureAccess {
  // ... existing features
  canAccessNewFeature: boolean; // Add new feature
}
```

### 2. Update Plan Features

```typescript
export function getFeatureAccess(plan: PlanType): FeatureAccess {
  const features: Record<PlanType, FeatureAccess> = {
    FREE: {
      // ... existing features
      canAccessNewFeature: false,
    },
    PRO: {
      // ... existing features
      canAccessNewFeature: true, // Enable for PRO+
    },
    // ... other plans
  };
}
```

### 3. Add Conditional Navigation (Optional)

```typescript
const navigation = [
  // ... existing items
  { 
    name: 'New Feature', 
    href: '/dashboard/new-feature', 
    icon: Star,
    requiresFeature: 'canAccessNewFeature'
  },
];

// Update filter logic
const visibleNavigation = navigation.filter((item) => {
  if (item.requiresFeature) {
    return features[item.requiresFeature];
  }
  return true;
});
```

## Testing

### Test Plan Upgrades

```bash
# Start app
npm run dev

# In Supabase SQL Editor:
# 1. Set organization to FREE
UPDATE "Organization" SET "plan" = 'FREE' WHERE "id" = 'your_org_id';

# Sign out and sign in - White-Label nav should be hidden

# 2. Upgrade to AGENCY
UPDATE "Organization" SET "plan" = 'AGENCY' WHERE "id" = 'your_org_id';

# Sign out and sign in - White-Label nav should be visible
```

### Test Feature Access

```typescript
// In browser console or test file
import { getFeatureAccess } from '@/lib/utils/feature-access';

console.log(getFeatureAccess('FREE'));
// { canAccessWhiteLabel: false, maxQRCodes: 3, ... }

console.log(getFeatureAccess('AGENCY'));
// { canAccessWhiteLabel: true, maxQRCodes: -1, ... }
```

## Stripe Integration (Future)

When integrating with Stripe, update organization plan on webhook:

```typescript
// app/api/stripe/webhook/route.ts
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const priceId = session.line_items.data[0].price.id;
  
  // Map Stripe price to plan
  const planMap = {
    'price_pro_monthly': 'PRO',
    'price_business_monthly': 'BUSINESS',
    'price_agency_monthly': 'AGENCY',
  };
  
  await prisma.organization.update({
    where: { id: organizationId },
    data: { 
      plan: planMap[priceId],
      isWhiteLabel: planMap[priceId] === 'AGENCY' 
    },
  });
}
```

## Security Considerations

### Server-Side Validation Required
Always validate feature access on the server:

```typescript
// ❌ BAD - Client can bypass
if (features.canExportReports) {
  exportReport(); // Client controls this
}

// ✅ GOOD - Server validates
async function exportReport() {
  const session = await auth();
  if (!hasFeatureAccess(session.user.organization.plan, 'canExportReports')) {
    throw new Error('Unauthorized');
  }
  // Export logic
}
```

### API Route Protection
Wrap API routes with feature checks:

```typescript
export async function POST(req: Request) {
  const session = await auth();
  const plan = session?.user?.organization?.plan || 'FREE';
  
  // Always check on server
  if (!hasFeatureAccess(plan, 'canUseAIOptimization')) {
    return Response.json({ error: 'Upgrade required' }, { status: 403 });
  }
}
```

## Migration Notes

### Existing Organizations
Default plan is `FREE`. To update existing organizations:

```sql
-- Set all existing orgs to appropriate plan
UPDATE "Organization" 
SET "plan" = CASE 
  WHEN "isWhiteLabel" = true THEN 'AGENCY'
  ELSE 'FREE'
END;
```

### Backward Compatibility
The system maintains `isWhiteLabel` field for backward compatibility:
- `plan = 'AGENCY'` automatically gets white-label access
- Old code checking `isWhiteLabel` still works
- New code should use `getFeatureAccess()` instead

## Related Files

- `lib/utils/feature-access.ts` - Core utility functions
- `prisma/schema.prisma` - Database schema with plan field
- `auth.ts` - Session includes organization plan
- `types/next-auth.d.ts` - TypeScript definitions
- `components/layout/dashboard-nav.tsx` - Plan-based navigation
- `prisma/migrations/20251230191652_add_organization_plan/` - Migration

## Benefits

✅ **Centralized Logic** - Single source of truth for feature access
✅ **Type-Safe** - Full TypeScript support
✅ **Flexible** - Easy to add new features and plans
✅ **Secure** - Server-side validation built-in
✅ **Scalable** - Works with any number of features
✅ **Maintainable** - Clear feature matrix
✅ **Performance** - Cached in JWT token

## Status
✅ **Complete** - Plan-based feature access system fully implemented
