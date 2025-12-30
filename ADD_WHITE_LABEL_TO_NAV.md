# Adding White-Label to Dashboard Navigation

## Quick Addition

To add the White-Label page to your dashboard navigation, update the navigation array in `components/layout/dashboard-nav.tsx`:

### Step 1: Add Import
```tsx
import {
  LayoutDashboard,
  QrCode,
  Menu,
  BarChart3,
  Users,
  UserCircle,
  Printer,
  Sparkles,
  Settings,
  LogOut,
  Palette, // Add this icon for white-label
} from 'lucide-react'
```

### Step 2: Add to Navigation Array
```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
  { name: 'Landing Pages', href: '/dashboard/landing-pages', icon: Sparkles },
  { name: 'Menus', href: '/dashboard/menus', icon: Menu },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'CRM', href: '/dashboard/crm', icon: UserCircle },
  { name: 'Print Orders', href: '/dashboard/print', icon: Printer },
  { name: 'AI Tools', href: '/dashboard/ai', icon: Sparkles },
  { name: 'White-Label', href: '/dashboard/white-label', icon: Palette }, // Add this line
  { name: 'Billing', href: '/dashboard/billing', icon: Settings },
]
```

That's it! The White-Label page will now appear in your dashboard navigation.

## Alternative Icons

You can use any of these icons from lucide-react:
- `Palette` - Paint palette (recommended)
- `Brush` - Paint brush
- `Paintbrush` - Alternative paintbrush
- `Layout` - Layout icon
- `Building` - Building/company icon
- `Globe` - Globe for custom domains

## Conditional Display (Optional)

If you want to show the White-Label link only for organizations with white-label enabled:

```tsx
interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  isWhiteLabel?: boolean // Add this prop
}

// In the component
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
  // ... other items
  ...(isWhiteLabel ? [{ name: 'White-Label', href: '/dashboard/white-label', icon: Palette }] : []),
  { name: 'Billing', href: '/dashboard/billing', icon: Settings },
]
```

Then pass the prop from the parent component:
```tsx
<DashboardNav user={user} isWhiteLabel={organization.isWhiteLabel} />
```

## Direct Access

You can also access the page directly without adding to navigation:
```
http://localhost:3000/dashboard/white-label
```

---

**Note**: The page is already built and functional. This is just for adding it to the sidebar navigation for easier access.
