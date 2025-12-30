# QR Code Templates Library System

A comprehensive template library with 50+ professional QR code designs, custom styling, and one-click application system for Qreate Studios.

## Features

### 📚 Template Library
- **50+ Professional Templates** across 15 categories
- Industry-specific designs (Restaurant, Retail, Real Estate, Events, etc.)
- Premium and free templates
- Pre-configured styles, colors, and frames

### 🎨 Design Features
- **5 Dot Styles**: square, rounded, dots, classy, extra-rounded
- **4 Corner Styles**: square, rounded, extra-rounded, dot
- **Color Customization**: Solid colors and gradients (linear, radial)
- **Frame Options**: none, basic, rounded, shadow, badge
- **Call-to-Action Text**: Customizable frame text (top/bottom positioning)
- **Error Correction Levels**: L, M, Q, H for different scanning environments

### 🔍 Search & Filter
- Real-time search by name, description, or category
- Category filtering with 15 categories
- Premium/Free filter toggle
- Favorites system
- Template count badges

### ♿ Accessibility (WCAG AA Compliant)
- Keyboard navigation throughout
- ARIA labels and roles
- Focus indicators
- Screen reader support
- Color contrast validation
- Semantic HTML

### 🎯 One-Click Application
- Click template to apply instantly
- Pre-fills all style settings
- Shows template info banner
- Clear template option
- Contrast ratio validation

## File Structure

```
lib/
├── templates/
│   └── qr-templates.ts              # 50+ template definitions
└── utils/
    └── color-contrast.ts             # WCAG color validation

app/
├── dashboard/
│   ├── templates/
│   │   └── page.tsx                  # Template gallery UI
│   └── qr-codes/
│       └── create/
│           └── page.tsx              # Updated with template integration
└── api/
    └── templates/
        └── [templateId]/
            └── route.ts              # Template API endpoint
```

## Template Categories

| Category | Count | Icon | Examples |
|----------|-------|------|----------|
| Restaurant | 5 | 🍽️ | Menu, Specials, WiFi, Reservations |
| Retail | 5 | 🛍️ | Product Info, Discounts, Sales, Reviews |
| Real Estate | 5 | 🏠 | Listings, Open House, For Sale |
| Events | 5 | 🎉 | Tickets, Registration, RSVP, Conferences |
| Business | 5 | 💼 | Business Cards, Professional, Creative |
| Payment | 4 | 💰 | Tips, Invoices, Donations, Checkout |
| Social Media | 5 | 📱 | Instagram, LinkedIn, TikTok, YouTube, X |
| Healthcare | 3 | 🏥 | Patient Portal, Appointments, Prescriptions |
| Fitness | 3 | 💪 | Workouts, Classes, Memberships |
| Education | 3 | 📚 | Courses, Assignments, Library |
| Hospitality | 3 | 🏨 | Hotels, Spa, Concierge |
| Transportation | 2 | 🚗 | Parking, Rideshare |
| Non-Profit | 2 | ❤️ | Volunteers, Fundraising |
| Technology | 2 | 💻 | App Downloads, Support |

**Total: 52 Templates**

## Template Interface

```typescript
interface QRTemplate {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: string;              // Category (e.g., "Restaurant")
  description: string;           // Short description
  preview: string;               // Preview image path
  isPremium: boolean;            // Premium flag
  style: {
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'extra-rounded';
    cornerSquareStyle: 'square' | 'rounded' | 'extra-rounded' | 'dot';
    cornerDotStyle: 'square' | 'rounded' | 'dot';
    backgroundColor: string;     // Hex color
    foregroundColor: string;     // Hex color
    gradientType?: 'linear' | 'radial';
    gradientColors?: [string, string];
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    margin: number;              // Quiet zone (0-10)
  };
  frame?: {
    type: 'none' | 'basic' | 'rounded' | 'shadow' | 'badge';
    color: string;               // Frame color (hex)
    text?: string;               // Call-to-action text
    textPosition: 'top' | 'bottom' | 'none';
    padding: number;             // Frame padding (px)
  };
}
```

## Usage

### Browse Templates
Navigate to `/dashboard/templates` to view the template gallery.

### Filter Templates
1. **Search**: Type keywords in search bar
2. **Category**: Click category buttons
3. **Premium**: Toggle premium filter
4. **Favorites**: Click heart icon to save favorites

### Apply Template
1. Click any template card
2. Redirects to QR creation page
3. Template auto-applies with banner showing details
4. All styles pre-configured
5. Create QR code as normal

### Clear Template
Click the X button in the template banner to remove applied template.

## API Endpoints

### GET `/api/templates/[templateId]`
Fetch a specific template by ID.

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "restaurant-menu-classic",
    "name": "Classic Menu",
    "category": "Restaurant",
    ...
  }
}
```

## Color Contrast Validation

### WCAG AA Requirements
- **Normal Text**: 4.5:1 minimum contrast ratio
- **Large Text**: 3:1 minimum contrast ratio
- **QR Codes**: 3:1 minimum for reliable scanning

### Functions Available

```typescript
import { 
  getContrastRatio,
  meetsWCAGAA,
  validateQRCodeColors,
  suggestContrastColor 
} from '@/lib/utils/color-contrast';

// Calculate contrast ratio
const ratio = getContrastRatio('#FFFFFF', '#000000'); // 21

// Check WCAG compliance
const compliant = meetsWCAGAA('#FFFFFF', '#000000'); // true

// Validate QR colors
const validation = validateQRCodeColors('#000000', '#FFFFFF');
// { isValid: true, ratio: 21, message: "Excellent contrast..." }

// Get suggested text color
const textColor = suggestContrastColor('#1E40AF'); // '#FFFFFF'
```

## Template Examples

### Restaurant - Classic Menu
```typescript
{
  id: 'restaurant-menu-classic',
  name: 'Classic Menu',
  category: 'Restaurant',
  isPremium: false,
  style: {
    dotStyle: 'rounded',
    cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#1F2937',
    errorCorrectionLevel: 'M',
    margin: 4,
  },
  frame: {
    type: 'rounded',
    color: '#EF4444',
    text: 'SCAN FOR MENU',
    textPosition: 'bottom',
    padding: 20,
  },
}
```

### Social Media - Instagram (Premium)
```typescript
{
  id: 'social-instagram',
  name: 'Instagram Profile',
  category: 'Social Media',
  isPremium: true,
  style: {
    dotStyle: 'dots',
    cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#E1306C',
    gradientType: 'linear',
    gradientColors: ['#FD1D1D', '#E1306C'],
    errorCorrectionLevel: 'M',
    margin: 4,
  },
  frame: {
    type: 'shadow',
    color: '#E1306C',
    text: 'Follow Us',
    textPosition: 'bottom',
    padding: 24,
  },
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Navigate between templates and controls |
| **Enter/Space** | Select template |
| **Arrow Keys** | Navigate category tabs |
| **Escape** | Close modals/clear filters |

## Accessibility Features

### Visual
- High contrast colors
- Focus indicators on all interactive elements
- Hover states for cards
- Color badges for categories
- Premium badges clearly marked

### Screen Readers
- ARIA labels on all buttons
- Role attributes (tablist, tab, tabpanel)
- aria-selected for active states
- aria-live for result counts
- Descriptive alt text

### Keyboard
- Logical tab order
- Keyboard shortcuts
- Focus management
- Skip links (if needed)

## Premium Features

Premium templates include:
- Gradient colors
- Advanced dot styles (dots, classy)
- Shadow frames
- Badge frames
- Higher error correction
- Exclusive designs

### Gating Premium Templates
```typescript
// In template API route
if (template.isPremium) {
  const hasAccess = await checkPremiumAccess(session.user.id);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Premium template requires subscription' }, 
      { status: 403 }
    );
  }
}
```

## Utility Functions

### Template Helpers
```typescript
import { 
  getTemplateById,
  getTemplatesByCategory,
  getPremiumTemplates,
  getFreeTemplates 
} from '@/lib/templates/qr-templates';

// Get specific template
const template = getTemplateById('restaurant-menu-classic');

// Get all restaurant templates
const restaurantTemplates = getTemplatesByCategory('Restaurant');

// Get only premium templates
const premiumTemplates = getPremiumTemplates();

// Get only free templates
const freeTemplates = getFreeTemplates();
```

## Performance

- Templates loaded from static array (no database queries)
- Lazy loading of template images
- Efficient filtering with memoization
- No external API calls
- Client-side only for gallery
- Server-side for QR generation

## Browser Support

- Modern browsers with ES2020+ support
- CSS Grid for layout
- Flexbox for cards
- CSS Variables for theming

## Next.js 15.5 Compatibility

✅ All route params properly awaited (async)
✅ 'use client' directives where needed
✅ Server components where appropriate
✅ No deprecated APIs used

## Future Enhancements

- [ ] Template designer tool
- [ ] User-created templates
- [ ] Template marketplace
- [ ] Bulk template application
- [ ] Template versioning
- [ ] A/B testing templates
- [ ] Template analytics
- [ ] Export template packs
- [ ] Template sharing

## Troubleshooting

### Templates not showing
- Check file path: `/dashboard/templates`
- Clear browser cache
- Check console for errors

### Template not applying
- Verify template ID in URL
- Check QR creation page integration
- Ensure template exists

### Colors not validating
- Ensure hex format (#RRGGBB)
- Check color-contrast utility import
- Review console for validation errors

## Best Practices

1. **Choose appropriate category**: Helps users find templates faster
2. **Test contrast ratios**: Use validation tools before deploying
3. **Provide clear descriptions**: Help users understand use cases
4. **Use appropriate error correction**: Higher for complex backgrounds
5. **Test scanning**: Verify QR codes scan reliably

## Support

For issues or questions about the template system, contact support or file an issue in the repository.
