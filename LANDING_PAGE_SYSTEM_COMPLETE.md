# Landing Page Builder & Security System

## Overview

Complete landing page builder with professional templates, AI integration, social payment links, and advanced anti-quishing security for Qreate Studios.

## Features Implemented

### 1. Landing Page Templates (`/lib/templates/landing-page-templates.ts`)

**10 Professional Templates:**
1. **Modern SaaS** - Clean design for software products
2. **Restaurant Menu** - Showcase menu with contact details
3. **Event Registration** - Promote events and collect RSVPs
4. **Product Launch** - Announce new products
5. **Lead Generation** - Capture leads with downloadable content
6. **Real Estate** - Property listings with photos
7. **Creative Portfolio** - Showcase creative work
8. **Webinar Registration** - Promote and register webinars
9. **Service Business** - For consultants and agencies
10. **Coming Soon** - Build anticipation for launches

**Section Types:**
- Hero (center, split, full-image, minimal layouts)
- Features grid
- Call-to-action
- Menu display
- Contact information
- Event details
- Registration forms
- Benefits list
- Lead capture forms
- Services list
- Email capture
- Countdown timers
- Portfolio grids
- Testimonials
- Pricing tables

### 2. Social Payment Integration (`/lib/services/social-payment-service.ts`)

**Supported Platforms:**
- **Instagram** - Bio link integration
- **TikTok** - Bio link integration
- **WhatsApp** - Click-to-chat with pre-filled payment message
- **SMS** - Text message with payment link
- **Facebook** - Messenger integration
- **Twitter** - Tweet with payment link

**Functions:**
- `generateSocialPaymentUrl()` - Generate platform-specific links
- `getSocialPlatformInstructions()` - User-friendly setup instructions

**Use Cases:**
- Influencer payment collection
- Content creator monetization
- Small business payments
- Event ticket sales
- Donation collection

### 3. Anti-Quishing Security (`/lib/services/anti-quishing-service.ts`)

**URL Scanning Features:**
- Suspicious TLD detection (.tk, .ml, .ga, .cf, .gq, .xyz)
- Typosquatting detection (PayPal, Amazon, Google, etc.)
- Excessive subdomain warnings
- IP address destination alerts
- Phishing keyword detection (verify, suspend, urgent, login)
- Homograph attack detection (lookalike characters)
- URL shortener warnings

**Risk Levels:**
- **Low** - Safe to proceed
- **Medium** - Proceed with caution
- **High** - Not recommended to proceed

**Functions:**
- `scanUrl(url)` - Perform comprehensive security scan
- `generateWarningMessage()` - Create user-friendly warning text

### 4. Landing Page APIs

#### `/api/landing-pages` (POST, GET)
- **POST**: Create new landing page
  - Requires: title, slug, content, theme
  - Optional: qrCodeId, clientId
  - Validates slug uniqueness
  
- **GET**: List all landing pages for user
  - Includes QR code associations
  - Sorted by creation date

#### `/api/landing-pages/[id]` (GET, PATCH, DELETE)
- **GET**: Retrieve landing page details
  - Includes QR code information
  - User authorization checked

- **PATCH**: Update landing page
  - Update title, slug, content, theme
  - Toggle published status
  
- **DELETE**: Delete landing page
  - User authorization required

### 5. Public Landing Page Renderer (`/app/l/[slug]/page.tsx`)

**Features:**
- Dynamic section rendering based on template
- View count tracking
- SEO-optimized output
- Mobile responsive design
- Accessible markup (WCAG AA)
- Powered by Qreate Studios footer

**Section Renderers:**
- HeroSection - Headlines and CTAs
- FeaturesSection - 3-column grid with icons
- CTASection - Call-to-action blocks
- MenuDisplaySection - Menu integration placeholder
- ContactSection - Contact info and maps
- EventDetailsSection - Event information cards
- RegistrationFormSection - Form with dynamic fields
- BenefitsSection - Checkmark list
- LeadFormSection - Lead capture with custom fields
- ServicesListSection - Service cards
- EmailCaptureSection - Email signup forms

### 6. Landing Page Dashboard (`/app/dashboard/landing-pages/page.tsx`)

**Features:**
- Grid view of all landing pages
- Published/Draft status badges
- View count statistics
- QR code associations
- Quick actions: Edit, View Live, Delete
- Empty state with call-to-action
- Responsive card layout

### 7. Template Selector (`/app/dashboard/landing-pages/create/page.tsx`)

**Features:**
- Visual template grid with icons
- Category badges (Business, Food, Events, Marketing, etc.)
- Keyboard-accessible selection
- "Generate with AI" button (placeholder)
- "Start from Scratch" option
- Template preview on hover
- One-click creation from template

**Template Icons:**
- 💼 Modern SaaS
- 🍽️ Restaurant Menu
- 🎟️ Event Registration
- 🚀 Product Launch
- 📥 Lead Generation
- 🏡 Real Estate
- 🎨 Creative Portfolio
- 🎥 Webinar
- 💡 Service Business
- ⏰ Coming Soon

### 8. Landing Page Editor (`/app/dashboard/landing-pages/[id]/edit/page.tsx`)

**Tabs:**
1. **Settings**
   - Page title editor
   - URL slug customization
   - Statistics (views, status)
   - Publish/unpublish toggle

2. **Content** (Coming Soon)
   - Visual section editor
   - Drag-and-drop reordering
   - Rich text editing

3. **Design** (Coming Soon)
   - Color customization
   - Font selection
   - Layout options

**Actions:**
- Save changes
- Publish/unpublish
- View live preview
- Real-time slug preview

### 9. Security Warning Page (`/app/security/warning/page.tsx`)

**Features:**
- Risk level display (Low/Medium/High)
- Color-coded warnings (yellow/orange/red)
- Phishing indicators list
- Security warnings list
- Destination URL display
- Safety tips section
- Go Back (recommended) button
- Continue Anyway button (dangerous)
- Tracking of warning bypasses

**Accessibility:**
- Screen reader announcements
- ARIA roles and labels
- High contrast warnings
- Keyboard navigation
- 44px minimum touch targets

### 10. QR Scan Security Integration (`/app/[shortCode]/route.ts`)

**Security Flow:**
1. Validate QR code status
2. Track scan analytics
3. **Perform URL security scan**
4. If high risk → redirect to warning page
5. If Zelle → special instruction page
6. Otherwise → redirect to destination

**Protection Against:**
- Phishing attacks
- Malware distribution
- Brand impersonation
- URL manipulation
- Suspicious redirects

## Database Schema

### LandingPage Table
```prisma
model LandingPage {
  id        String   @id @default(cuid())
  userId    String
  qrCodeId  String?  @unique
  title     String
  slug      String   @unique
  content   Json     // Template sections and configuration
  theme     Json?    // Colors, fonts, styles
  published Boolean  @default(false)
  views     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## User Flows

### Creating a Landing Page
1. Navigate to Dashboard → Landing Pages
2. Click "Create Landing Page"
3. Choose template or generate with AI
4. Customize content in editor
5. Configure settings (title, slug)
6. Preview changes
7. Publish when ready
8. Share public URL or link to QR code

### Social Payment Setup
1. Create payment QR code
2. Generate social payment link
3. Choose platform (Instagram, TikTok, WhatsApp, etc.)
4. Copy generated link
5. Add to social media bio/profile
6. Customers scan QR or click link to pay

### Security Warning Flow
1. User scans QR code
2. System performs URL security scan
3. If threats detected → warning page shown
4. User reads risk assessment
5. Option to go back (recommended) or proceed
6. If proceed → warning bypass tracked

## Accessibility Features

All pages meet WCAG AA standards:

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order
- Skip links where appropriate
- Keyboard shortcuts documented

**Screen Readers:**
- ARIA labels on all controls
- Role attributes for custom widgets
- Live regions for dynamic updates
- Descriptive alt text

**Visual Design:**
- 4.5:1 minimum color contrast
- Focus indicators on all elements
- No color-only information
- Resizable text support

**Touch Targets:**
- Minimum 44px × 44px
- Adequate spacing between elements
- Mobile-friendly layouts

## API Examples

### Create Landing Page
```typescript
POST /api/landing-pages
{
  "title": "My Landing Page",
  "slug": "my-page",
  "content": {
    "sections": [
      {
        "type": "hero",
        "config": {
          "headline": "Welcome",
          "subheadline": "Discover amazing products",
          "ctaText": "Get Started",
          "ctaUrl": "#signup"
        }
      }
    ]
  },
  "theme": {},
  "qrCodeId": "optional-qr-id"
}
```

### Update Landing Page
```typescript
PATCH /api/landing-pages/[id]
{
  "title": "Updated Title",
  "published": true
}
```

### Generate Social Payment Link
```typescript
import { generateSocialPaymentUrl } from '@/lib/services/social-payment-service';

const link = generateSocialPaymentUrl({
  platform: 'whatsapp',
  phoneNumber: '+15551234567',
  message: 'Hi! Send payment here:',
}, 'https://qreate.studio/pay/abc123');
// Returns: https://wa.me/15551234567?text=Hi!%20Send%20payment%20here%3A%20https%3A%2F%2Fqreate.studio%2Fpay%2Fabc123
```

### Scan URL for Threats
```typescript
import { scanUrl } from '@/lib/services/anti-quishing-service';

const result = await scanUrl('https://suspicious-site.com');

if (result.risk === 'high') {
  // Show warning page
  console.log('Phishing indicators:', result.phishingIndicators);
  console.log('Warnings:', result.warnings);
}
```

## Testing Checklist

### Landing Pages
- [ ] User can create landing page from template
- [ ] Slug uniqueness enforced
- [ ] Published pages visible at /l/[slug]
- [ ] Unpublished pages return 404
- [ ] View counts increment correctly
- [ ] Edit page saves changes
- [ ] Delete removes landing page

### Social Payments
- [ ] Instagram link generates correctly
- [ ] TikTok link generates correctly
- [ ] WhatsApp link opens chat with message
- [ ] SMS link opens text app with message
- [ ] Facebook Messenger link works
- [ ] Twitter link creates tweet

### Security
- [ ] Suspicious URLs trigger warning page
- [ ] High-risk URLs show red warnings
- [ ] Medium-risk URLs show orange warnings
- [ ] Phishing indicators detected correctly
- [ ] URL shorteners flagged
- [ ] IP addresses flagged
- [ ] Typosquatting detected
- [ ] User can proceed after warning
- [ ] User can go back safely

### Accessibility
- [ ] All pages keyboard navigable
- [ ] Screen reader announces properly
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets 44px minimum
- [ ] Forms have proper labels
- [ ] Error messages announced

## Future Enhancements

- [ ] Visual drag-and-drop editor
- [ ] AI content generation integration
- [ ] Custom domain mapping
- [ ] A/B testing support
- [ ] Form submission handling
- [ ] Email marketing integration
- [ ] Analytics dashboard per page
- [ ] SEO optimization tools
- [ ] Custom CSS injection
- [ ] Multi-language support
- [ ] Collaboration features
- [ ] Version history
- [ ] Template marketplace
- [ ] Advanced security (VirusTotal API)
- [ ] Real-time collaboration

## Security Best Practices

1. **URL Validation**
   - Always scan external URLs
   - Validate redirect chains
   - Check SSL certificates
   - Monitor for suspicious patterns

2. **User Data Protection**
   - Sanitize all form inputs
   - Prevent XSS attacks
   - Use CSRF tokens
   - Rate limit API requests

3. **Content Security**
   - Validate uploaded content
   - Scan for malicious scripts
   - Implement CSP headers
   - Review user-generated content

4. **Monitoring**
   - Track security warnings bypassed
   - Log suspicious activity
   - Alert on pattern detection
   - Regular security audits

## Support

For issues with landing pages:
- Check slug is unique and valid
- Verify content JSON structure
- Ensure user has permissions
- Review console for errors

For security warnings:
- Not all warnings mean danger
- Medium risk may be false positives
- High risk should be avoided
- Report false positives to improve system

For social payment links:
- Verify platform requirements
- Test links before sharing
- Include clear payment instructions
- Monitor conversion rates
