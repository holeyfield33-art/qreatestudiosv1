# White-Label System - Quick Start Guide

## 🚀 Overview
Complete white-label multi-tenancy system for agencies to rebrand, manage clients, and track revenue.

## ⚡ Quick Setup (5 minutes)

### Step 1: Run Database Migration
```bash
# Copy the SQL from prisma/migrations/add_white_label_columns.sql
# Run it in your Supabase SQL Editor

# Or connect via psql:
psql $DATABASE_URL -f prisma/migrations/add_white_label_columns.sql

# Then regenerate Prisma client:
npx prisma generate
```

### Step 2: Enable White-Label for Your Organization
```sql
-- In Supabase SQL Editor or psql
UPDATE "Organization" 
SET "isWhiteLabel" = true 
WHERE "id" = 'your_org_id_here';
```

Or programmatically:
```typescript
import { enableWhiteLabel } from '@/lib/services/white-label-service';
await enableWhiteLabel('your_org_id');
```

### Step 3: Access the Dashboard
Navigate to: `http://localhost:3000/dashboard/white-label`

## 📋 Features Checklist

### ✅ Custom Branding
- [x] Company name customization
- [x] Logo URL with preview
- [x] Primary, secondary, accent colors
- [x] Custom support email
- [x] Real-time validation
- [x] Save/reset functionality

### ✅ Custom Domain Setup
- [x] Domain configuration interface
- [x] DNS record generation (A, CNAME)
- [x] Copy-to-clipboard for DNS values
- [x] Setup instructions
- [x] Domain removal

### ✅ Sub-Account Management
- [x] Create client sub-accounts
- [x] Auto-generate temp passwords (12 char)
- [x] Email validation
- [x] List all sub-accounts
- [x] Delete sub-accounts
- [x] Role management

### ✅ Revenue Dashboard
- [x] Total revenue tracking
- [x] Agency share calculation (70%)
- [x] Platform fee calculation (30%)
- [x] Sub-account count
- [x] QR code count
- [x] Total scans metric

## 🎯 Common Use Cases

### Use Case 1: Rebrand for Agency
```typescript
// 1. Update branding via UI or API
const branding = {
  companyName: 'MyAgency QR',
  logo: { url: 'https://myagency.com/logo.png' },
  colors: {
    primary: '#FF5733',
    secondary: '#C70039',
    accent: '#900C3F'
  },
  supportEmail: 'support@myagency.com'
};

// POST /api/organization/branding
fetch('/api/organization/branding', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(branding)
});
```

### Use Case 2: Setup Custom Domain
```typescript
// 1. Configure domain
fetch('/api/organization/domain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: 'app.myagency.com' })
});

// 2. Copy DNS records from response
// 3. Add to domain provider:
//    A record: @ → 76.76.21.21
//    CNAME: www → cname.vercel-dns.com
// 4. Wait 24-48 hours for propagation
// 5. Verify in Vercel dashboard
```

### Use Case 3: Onboard New Client
```typescript
// 1. Create sub-account
const response = await fetch('/api/organization/sub-accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'ACME Corp',
    email: 'admin@acme.com'
  })
});

const { tempPassword } = await response.json();

// 2. Send credentials to client
// 3. Client logs in and changes password
// 4. Client creates QR codes under your brand
```

### Use Case 4: Track Revenue
```typescript
// Get stats via API
const response = await fetch('/api/organization/stats');
const { stats } = await response.json();

console.log(`Total Revenue: $${stats.revenue}`);
console.log(`Your Share (70%): $${stats.yourShare}`);
console.log(`Platform Fee (30%): $${stats.platformFee}`);
console.log(`Sub-Accounts: ${stats.subAccounts}`);
console.log(`QR Codes: ${stats.qrCodes}`);
console.log(`Total Scans: ${stats.totalScans}`);
```

## 🔧 API Reference

### Branding API
```bash
# Get current branding
GET /api/organization/branding

# Update branding
PATCH /api/organization/branding
Body: {
  "companyName": "string",
  "logo": { "url": "string" },
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex"
  },
  "supportEmail": "email@example.com"
}

# Reset to defaults
DELETE /api/organization/branding
```

### Domain API
```bash
# Configure domain
POST /api/organization/domain
Body: { "domain": "app.yourcompany.com" }

# Get current domain
GET /api/organization/domain

# Remove domain
DELETE /api/organization/domain
```

### Sub-Accounts API
```bash
# Create sub-account
POST /api/organization/sub-accounts
Body: {
  "name": "Client Name",
  "email": "client@example.com"
}
Response: {
  "success": true,
  "subAccount": {...},
  "tempPassword": "abc123xyz789"
}

# List sub-accounts
GET /api/organization/sub-accounts

# Delete sub-account
DELETE /api/organization/sub-accounts?id=user_id
```

### Stats API
```bash
# Get white-label statistics
GET /api/organization/stats
Response: {
  "success": true,
  "stats": {
    "subAccounts": 5,
    "qrCodes": 150,
    "totalScans": 12450,
    "revenue": 500.00,
    "revenueShare": 70,
    "yourShare": 350.00,
    "platformFee": 150.00
  }
}
```

## 🎨 UI Components Used

All components from shadcn/ui:
- `Card` - Dashboard cards and sections
- `Button` - All actions
- `Input` - Text, email, URL, color inputs
- `Label` - Form labels
- `Tabs` - Main navigation (Branding, Domain, Accounts, Revenue)
- `Badge` - Role badges, DNS record types
- Toast notifications via `sonner`
- Icons from `lucide-react`

## 🔐 Security Features

### Authentication
- NextAuth v5 (Auth.js) session validation
- Organization membership verification
- Sub-account ownership checks

### Validation
- Domain format (regex: proper domain structure)
- Email format (regex + RFC 5322 compliance)
- Hex color codes (#RRGGBB format)
- URL validation (logo, website)
- Max length constraints (company name 100 chars)

### Data Protection
- Password hashing (bcryptjs, 12 rounds)
- Parameterized SQL queries (Prisma)
- JSONB for structured config
- Foreign key constraints with CASCADE
- Unique constraints on domains/emails

## ♿ Accessibility (WCAG AA)

### Implemented
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels on inputs
- ✅ Focus indicators
- ✅ Semantic HTML (form, label, button)
- ✅ Toast notifications announced
- ✅ Color contrast compliance
- ✅ Alt text for images
- ✅ Screen reader friendly

## 🐛 Troubleshooting

### TypeScript Errors After Schema Update
```bash
# Clear Prisma cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate

# Restart VS Code TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Domain Not Working
1. Verify DNS with: `dig app.yourcompany.com`
2. Check DNS propagation: `https://dnschecker.org`
3. Wait full 48 hours
4. Add domain to Vercel project settings
5. Verify in Vercel domains dashboard

### Sub-Account Can't Login
1. Check temp password was saved
2. Verify user exists in database
3. Ensure `isSubAccount = true`
4. Check `parentOrganizationId` is set
5. Verify password hash exists

### Branding Not Showing
1. Verify `isWhiteLabel = true`
2. Check `branding` JSONB is valid
3. Clear browser cache
4. Verify logo URL is accessible
5. Check color hex codes

## 📊 Database Schema

### Organization Table
```sql
isWhiteLabel      BOOLEAN  (Feature flag)
customDomain      TEXT     (e.g., app.client.com)
branding          JSONB    (Company name, logo, colors, email)
smtpConfig        JSONB    (Custom email server config)
revenueShare      INTEGER  (Percentage, default 70)
```

### User Table
```sql
parentOrganizationId TEXT    (Reference to Organization)
isSubAccount         BOOLEAN (Sub-account flag)
```

## 🚢 Deployment Checklist

- [ ] Run database migration in production
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Enable white-label for organizations
- [ ] Configure environment variables
- [ ] Test custom domain setup
- [ ] Verify DNS configuration
- [ ] Test sub-account creation
- [ ] Validate revenue calculations
- [ ] Test all API endpoints
- [ ] Verify accessibility features
- [ ] Check mobile responsiveness
- [ ] Test error handling
- [ ] Verify toast notifications
- [ ] Test copy-to-clipboard
- [ ] Validate form inputs
- [ ] Check loading states

## 📚 Documentation Files

- `WHITE_LABEL_SYSTEM_COMPLETE.md` - Complete documentation (architecture, features, troubleshooting)
- `WHITE_LABEL_QUICK_START.md` - This file (quick setup, common use cases, API reference)
- `prisma/migrations/add_white_label_columns.sql` - Database migration
- `prisma/schema.prisma` - Updated Prisma schema

## 💡 Tips & Best Practices

### Performance
- Use JSONB for flexible config storage
- Index custom domains for fast lookups
- Cache branding config in memory
- Batch sub-account operations

### Security
- Always validate domain ownership
- Rate limit sub-account creation
- Require strong passwords
- Audit all branding changes
- Monitor revenue calculations

### UX
- Show DNS propagation status
- Send welcome emails to sub-accounts
- Provide branding previews
- Auto-save draft changes
- Confirm destructive actions

### Maintenance
- Regular backup of branding configs
- Monitor domain expiration
- Track revenue share changes
- Audit sub-account activity
- Review SMTP configurations

## 🎉 Success Metrics

Track these KPIs:
- Number of white-label organizations
- Custom domains configured
- Sub-accounts created per organization
- Average revenue per organization
- QR codes generated per sub-account
- Total scans across white-label instances
- Domain setup success rate
- Sub-account onboarding time

## 🆘 Support

For issues or questions:
1. Check `WHITE_LABEL_SYSTEM_COMPLETE.md` for detailed docs
2. Review API responses for error messages
3. Check browser console for client-side errors
4. Verify database schema matches Prisma
5. Test with curl for API debugging
6. Check Vercel logs for server errors

## 🔄 Version History

**v1.0.0** (Current)
- Initial release
- Complete rebrand engine
- Custom domain mapping
- Sub-account management
- Revenue sharing dashboard
- WCAG AA accessibility
- Comprehensive documentation

---

**Built with**: Next.js 15.5, Prisma, NextAuth v5, TypeScript, shadcn/ui

**Status**: ✅ Production Ready
