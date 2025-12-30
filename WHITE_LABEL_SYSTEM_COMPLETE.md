# White-Label Multi-Tenancy System - Complete Guide

## Overview
Complete white-label system allowing agencies to fully rebrand the platform, use custom domains, manage client sub-accounts, and track revenue sharing.

## Features Implemented

### 1. Complete Rebrand Engine
- **Custom Branding Configuration**
  - Company name and logo
  - Primary, secondary, and accent colors
  - Custom support email
  - Font customization support
  
- **Visual Customization**
  - Logo preview with error handling
  - Color picker with hex code input
  - Real-time preview of branding changes
  - Validation for all inputs

### 2. Custom Domain Mapping
- **Domain Configuration**
  - Clean domain input (removes https://, www)
  - Domain format validation (regex)
  - Duplicate domain prevention
  - DNS record generation

- **DNS Setup Instructions**
  - A record: @ → 76.76.21.21 (Vercel IP)
  - CNAME record: www → cname.vercel-dns.com
  - Copy-to-clipboard functionality
  - Step-by-step setup guide

### 3. Client Sub-Account Management
- **Account Creation**
  - Prompt-based creation (name + email)
  - Automatic temporary password generation (12 characters, alphanumeric)
  - Password hashing with bcryptjs (12 rounds)
  - Email validation and duplicate prevention
  - Temporary password displayed via toast notification (10s duration)

- **Account Management**
  - List all sub-accounts with roles
  - Delete sub-accounts with confirmation
  - Creation date tracking
  - Role badge display

### 4. Revenue Sharing Dashboard
- **Financial Metrics**
  - Total revenue tracking
  - Agency share calculation (default 70%)
  - Platform fee calculation (30%)
  - Real-time updates

- **Business Metrics**
  - Active sub-accounts count
  - Total QR codes generated
  - Total scan analytics
  - Revenue per sub-account insights

## Architecture

### Service Layer
**File**: `lib/services/white-label-service.ts`

```typescript
// Core Functions
getBrandingForDomain(domain: string) // Fetch branding by custom domain
getBrandingForOrganization(organizationId: string) // Fetch branding by org
updateBranding(organizationId: string, branding: Partial<BrandingConfig>) // Update branding
setCustomDomain(organizationId: string, domain: string) // Configure custom domain
removeDomain(organizationId: string) // Remove custom domain
updateSMTPConfig(organizationId: string, config: SMTPConfig) // SMTP settings
updateRevenueShare(organizationId: string, percentage: number) // Revenue split
enableWhiteLabel(organizationId: string) // Enable white-label
disableWhiteLabel(organizationId: string) // Disable white-label
validateBranding(branding: Partial<BrandingConfig>) // Validation
getWhiteLabelStats(organizationId: string) // Dashboard stats
```

### API Routes

#### 1. Branding API (`/api/organization/branding`)
- **GET**: Fetch current branding configuration
  - Returns: `{ success: true, branding: BrandingConfig }`
  - Auth: Required (NextAuth session)
  
- **PATCH**: Update branding configuration
  - Body: `{ companyName?, logo?, colors?, supportEmail? }`
  - Validates all fields before updating
  - Merges partial updates with existing config
  - Returns: `{ success: true, branding: BrandingConfig }`
  
- **DELETE**: Reset to default branding
  - Returns: `{ success: true, message: 'Branding reset' }`

#### 2. Custom Domain API (`/api/organization/domain`)
- **POST**: Configure custom domain
  - Body: `{ domain: string }`
  - Cleans domain (removes protocol, www)
  - Validates domain format
  - Checks for duplicates
  - Returns DNS records with setup instructions
  - Returns: `{ success: true, dnsRecords: [...], message: 'Domain configured' }`
  
- **GET**: Fetch current domain configuration
  - Returns: `{ success: true, domain: string, dnsRecords: [...] }`
  
- **DELETE**: Remove custom domain
  - Returns: `{ success: true, message: 'Domain removed' }`

#### 3. Sub-Accounts API (`/api/organization/sub-accounts`)
- **POST**: Create new sub-account
  - Body: `{ name: string, email: string }`
  - Generates 12-char alphanumeric temp password
  - Hashes password with bcryptjs
  - Validates email format
  - Prevents duplicate emails
  - Returns: `{ success: true, subAccount: {...}, tempPassword: string }`
  
- **GET**: List all sub-accounts
  - Returns: `{ success: true, subAccounts: [...] }`
  
- **DELETE**: Remove sub-account
  - Query: `?id=userId`
  - Verifies ownership before deletion
  - Returns: `{ success: true, message: 'Sub-account deleted' }`

#### 4. Stats API (`/api/organization/stats`)
- **GET**: Fetch white-label statistics
  - Calculates: subAccounts, qrCodes, totalScans, revenue
  - Applies revenue sharing percentage
  - Returns: `{ success: true, stats: { ...metrics, yourShare, platformFee } }`

### User Interface

**File**: `app/dashboard/white-label/page.tsx`

#### Tabs Structure
1. **Branding Tab**
   - Company name input
   - Support email input
   - Logo URL input with preview
   - Color pickers (primary, secondary, accent)
   - Save button with loading state

2. **Custom Domain Tab**
   - Domain input field
   - Configure/Remove buttons
   - DNS records display with copy buttons
   - Setup instructions
   - Propagation warning (48 hours)

3. **Sub-Accounts Tab**
   - Add sub-account button
   - List of existing sub-accounts
   - Delete button per account
   - Role badges
   - Creation date display

4. **Revenue Tab**
   - Total revenue card
   - Your share card (with percentage)
   - Platform fee card
   - Total scans card
   - Sub-accounts count card
   - Active QR codes card

#### UI Features
- Real-time data fetching on mount
- Toast notifications (sonner) for all actions
- Copy-to-clipboard with visual feedback (check icon)
- Confirmation dialogs for destructive actions
- Loading states on all buttons
- Responsive grid layout
- Color-coded revenue cards with gradients
- Error handling for logo preview

## Database Schema

### Required Columns (Add to Organization table)
```sql
-- White-label feature flags
ALTER TABLE "Organization" ADD COLUMN "isWhiteLabel" BOOLEAN DEFAULT false;

-- Custom domain
ALTER TABLE "Organization" ADD COLUMN "customDomain" TEXT UNIQUE;

-- Branding configuration (JSONB)
ALTER TABLE "Organization" ADD COLUMN "branding" JSONB DEFAULT '{
  "companyName": "Qreate Studios",
  "logo": {"url": "/logo.png"},
  "colors": {"primary": "#3b82f6", "secondary": "#1e40af", "accent": "#10b981"},
  "supportEmail": "support@qreatestudios.com"
}';

-- SMTP configuration (JSONB)
ALTER TABLE "Organization" ADD COLUMN "smtpConfig" JSONB DEFAULT '{}';

-- Revenue sharing percentage (default 70%)
ALTER TABLE "Organization" ADD COLUMN "revenueShare" INTEGER DEFAULT 70;

-- Parent organization for sub-accounts
ALTER TABLE "User" ADD COLUMN "parentOrganizationId" TEXT;
ALTER TABLE "User" ADD COLUMN "isSubAccount" BOOLEAN DEFAULT false;

-- Add foreign key
ALTER TABLE "User" ADD CONSTRAINT "User_parentOrganizationId_fkey" 
  FOREIGN KEY ("parentOrganizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

-- Create index for custom domain lookups
CREATE INDEX "Organization_customDomain_idx" ON "Organization"("customDomain");
```

### Prisma Schema Updates
```prisma
model Organization {
  id            String   @id @default(cuid())
  name          String
  isWhiteLabel  Boolean  @default(false)
  customDomain  String?  @unique
  branding      Json?
  smtpConfig    Json?
  revenueShare  Int      @default(70)
  members       OrganizationMember[]
  qrCodes       QRCode[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([customDomain])
}

model User {
  id                   String  @id @default(cuid())
  email                String  @unique
  name                 String?
  password             String?
  parentOrganizationId String?
  isSubAccount         Boolean @default(false)
  // ... other fields
  parentOrganization   Organization? @relation(fields: [parentOrganizationId], references: [id], onDelete: Cascade)
}
```

## Setup Instructions

### 1. Database Setup
```bash
# Run SQL commands in Supabase SQL Editor
# Copy commands from "Database Schema" section above

# Pull schema changes into Prisma
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

### 2. Enable White-Label for Organization
```typescript
// Via service
import { enableWhiteLabel } from '@/lib/services/white-label-service';
await enableWhiteLabel('org_id_here');

// Via SQL
UPDATE "Organization" SET "isWhiteLabel" = true WHERE "id" = 'org_id_here';
```

### 3. Access White-Label Dashboard
Navigate to: `/dashboard/white-label`

## Usage Workflows

### Workflow 1: Configure Branding
1. Navigate to Branding tab
2. Enter company name
3. Add support email
4. Paste logo URL
5. Choose colors using picker or hex input
6. Click "Save Branding"
7. Success toast confirms save

### Workflow 2: Setup Custom Domain
1. Navigate to Custom Domain tab
2. Enter domain (e.g., `app.yourcompany.com`)
3. Click "Configure"
4. Copy DNS records to your domain provider:
   - Add A record: @ → 76.76.21.21
   - Add CNAME record: www → cname.vercel-dns.com
5. Wait for DNS propagation (up to 48 hours)
6. Verify in Vercel dashboard

### Workflow 3: Create Sub-Account
1. Navigate to Sub-Accounts tab
2. Click "Add Sub-Account"
3. Enter client name in prompt
4. Enter client email in prompt
5. Note temporary password (displayed for 10 seconds)
6. Share credentials with client
7. Client changes password on first login

### Workflow 4: Monitor Revenue
1. Navigate to Revenue tab
2. View total revenue card
3. Check your share (70% default)
4. Monitor platform fee (30% default)
5. Track sub-accounts and QR code usage
6. View total scans metric

## Security Features

### Authentication
- NextAuth v5 (Auth.js) session validation
- All API routes require authentication
- Organization membership verification
- Sub-account ownership checks

### Validation
- Domain format validation (regex)
- Email format validation
- Hex color code validation
- URL validation for logos
- Company name max length (100 chars)
- Duplicate prevention (domains, emails)

### Data Protection
- Password hashing with bcryptjs (12 rounds)
- JSONB for structured config storage
- Foreign key constraints with CASCADE delete
- Unique constraints on domains
- SQL injection prevention (parameterized queries)

## Accessibility (WCAG AA)

### Keyboard Navigation
- All tabs accessible via keyboard
- Form fields tab-navigable
- Buttons accessible with Enter/Space
- Color pickers keyboard-accessible

### Screen Readers
- Semantic HTML (form, fieldset, label)
- ARIA labels on color pickers
- Toast notifications announced
- Form validation messages accessible
- Button loading states announced

### Visual
- High contrast color pickers
- Focus indicators on all interactive elements
- Error messages clearly visible
- Success feedback via toast
- Color preview for accessibility testing

## Customization Options

### Revenue Share Adjustment
```typescript
import { updateRevenueShare } from '@/lib/services/white-label-service';
await updateRevenueShare('org_id', 80); // 80% to agency, 20% to platform
```

### Custom SMTP Configuration
```typescript
import { updateSMTPConfig } from '@/lib/services/white-label-service';
await updateSMTPConfig('org_id', {
  host: 'smtp.example.com',
  port: 587,
  secure: true,
  user: 'apikey',
  pass: 'your_api_key',
  from: 'noreply@yourcompany.com',
});
```

### Branding Defaults
Edit `getDefaultBranding()` in `white-label-service.ts`:
```typescript
function getDefaultBranding(): BrandingConfig {
  return {
    companyName: 'Your Platform Name',
    logo: { url: '/your-logo.png' },
    colors: {
      primary: '#your-primary',
      secondary: '#your-secondary',
      accent: '#your-accent',
    },
    supportEmail: 'support@yourplatform.com',
  };
}
```

## Testing

### Manual Testing Checklist
- [ ] Create organization with white-label enabled
- [ ] Access white-label dashboard
- [ ] Update branding and verify save
- [ ] Upload logo and check preview
- [ ] Configure custom domain and verify DNS records
- [ ] Create sub-account and note temp password
- [ ] Verify sub-account can login
- [ ] Delete sub-account and confirm removal
- [ ] Check revenue dashboard calculations
- [ ] Test domain removal
- [ ] Reset branding to defaults
- [ ] Verify all toast notifications
- [ ] Test clipboard copy functionality
- [ ] Validate email format checking
- [ ] Confirm duplicate domain prevention

### API Testing
```bash
# Test branding API
curl -X GET http://localhost:3000/api/organization/branding \
  -H "Cookie: authjs.session-token=..."

# Test domain configuration
curl -X POST http://localhost:3000/api/organization/domain \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"domain":"app.example.com"}'

# Test sub-account creation
curl -X POST http://localhost:3000/api/organization/sub-accounts \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"name":"Test Client","email":"client@example.com"}'

# Test stats API
curl -X GET http://localhost:3000/api/organization/stats \
  -H "Cookie: authjs.session-token=..."
```

## Troubleshooting

### Issue: Domain not working after DNS setup
**Solution**: 
1. Verify DNS records with `dig app.yourcompany.com`
2. Wait full 48 hours for propagation
3. Check Vercel dashboard for domain verification
4. Ensure domain is added to Vercel project settings

### Issue: Sub-account can't login
**Solution**:
1. Verify temporary password was saved correctly
2. Check user exists in database
3. Ensure password hash was generated
4. Verify isSubAccount flag is true
5. Check parentOrganizationId is set

### Issue: Branding not applying
**Solution**:
1. Verify organization has isWhiteLabel = true
2. Check branding JSON is valid
3. Clear browser cache
4. Verify logo URL is accessible
5. Check color hex codes are valid

### Issue: Revenue stats not showing
**Solution**:
1. Verify organization has QR codes
2. Check analytics data exists
3. Ensure revenueShare is set (default 70)
4. Verify sub-account relationships
5. Check scan tracking is working

## Future Enhancements

### Planned Features
- [ ] Custom email templates editor
- [ ] White-label landing page builder
- [ ] Advanced revenue analytics with charts
- [ ] Automated client onboarding flows
- [ ] Custom pricing tiers per sub-account
- [ ] API access for sub-accounts
- [ ] Webhook configuration for events
- [ ] Multi-language support for branding
- [ ] Custom CSS injection
- [ ] Advanced permission management
- [ ] Audit logs for all actions
- [ ] Bulk sub-account import (CSV)

### Integration Opportunities
- Stripe Connect for revenue splits
- SendGrid/Mailgun for SMTP
- Cloudflare for DNS management
- Auth0 for SSO
- Zapier for automation
- Slack for notifications

## Support

### Documentation
- See this guide for complete implementation details
- Check `/lib/services/white-label-service.ts` for service methods
- Review API route files for endpoint specifications
- Refer to UI component for integration examples

### Common Questions
**Q: Can I use multiple custom domains?**
A: Currently one domain per organization. Contact support for multi-domain needs.

**Q: How do I change revenue sharing percentage?**
A: Use `updateRevenueShare()` service method or SQL update.

**Q: Can sub-accounts create their own sub-accounts?**
A: Not currently. Only parent organizations can create sub-accounts.

**Q: Is there a limit on sub-accounts?**
A: No hard limit. Consider plan pricing for large numbers.

**Q: Can I customize the dashboard layout?**
A: Edit `app/dashboard/white-label/page.tsx` to customize tabs and layout.

## Changelog

### Version 1.0.0 (Current)
- ✅ Complete rebrand engine
- ✅ Custom domain mapping
- ✅ Sub-account management
- ✅ Revenue sharing dashboard
- ✅ WCAG AA accessibility
- ✅ Toast notifications
- ✅ Copy-to-clipboard functionality
- ✅ DNS setup instructions
- ✅ Comprehensive validation
- ✅ Service layer architecture
- ✅ TypeScript interfaces
- ✅ NextAuth v5 integration
- ✅ Next.js 15.5 compatibility

---

**System Status**: ✅ Production Ready  
**Last Updated**: 2025
**Maintainer**: Qreate Studios Development Team
