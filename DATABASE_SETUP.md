# Database Connection Setup

## Your Supabase Details

**Project URL**: `https://xxdjbdyxkeggnvjaucfr.supabase.co`
**Project Reference**: `xxdjbdyxkeggnvjaucfr`
**Database Password**: `Holeyfield19`

## Current Issue

The dev container environment cannot connect to your Supabase database due to IPv6 networking restrictions.

## Solutions

### Option 1: Get Correct Connection String from Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Under **Connection string**, find the **URI** format
4. Look for either:
   - **Transaction** mode (port 5432) - for migrations
   - **Session** mode (port 6543) - for connection pooling
   
5. Copy the connection string and update `.env`:

```bash
# For direct connection (port 5432)
DATABASE_URL="postgresql://postgres.xxdjbdyxkeggnvjaucfr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# OR for pooled connection (port 6543) - recommended
DATABASE_URL="postgresql://postgres.xxdjbdyxkeggnvjaucfr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Replace `[YOUR-PASSWORD]` with `Holeyfield19`

### Option 2: Use Direct Database URL

In Supabase Dashboard → Settings → Database, find the **Connection pooling** section and get the correct pooler URL format.

### Option 3: Run Database Setup Locally

If the dev container has networking issues, you can:

1. **Install PostgreSQL client locally** (if not in container)
2. **Or use Supabase SQL Editor** in the dashboard to run migrations manually

## Setting Up Database (Once Connected)

### Method 1: Prisma Push (Development)

```bash
npx prisma db push
```

This will create all tables in your database.

### Method 2: Prisma Migrate (Production-ready)

```bash
npx prisma migrate dev --name init
```

This creates migration files you can version control.

### Method 3: Manual SQL (via Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Run this to create tables manually (see below for SQL)

## Your Database Schema Summary

The Prisma schema includes:

### Core Tables
- **User** - User accounts and authentication
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

### Business Tables
- **Organization** - Team/company accounts
- **OrganizationMember** - Team members
- **Client** - Business clients
- **QRCode** - QR code records (main feature)
- **Analytics** - QR code scan tracking
- **LandingPage** - Custom landing pages
- **Menu** / **MenuCategory** / **MenuItem** - Digital menus

### CRM Tables
- **Contact** - Customer/lead contacts
- **Task** - To-do items
- **Note** - Contact notes

### Commerce Tables
- **PrintOrder** - Physical QR code print orders
- **Subscription** - User subscriptions
- **AIUsage** - AI feature usage tracking

### Admin Tables
- **SecurityReport** - Security/abuse reports
- **AuditLog** - Activity logging
- **FeatureFlag** - Feature toggles

## Verification

Once connected, verify with:

```bash
# List all tables
npx prisma studio
```

This opens a GUI at http://localhost:5555 to browse your database.

## Troubleshooting

### Error: "Can't reach database server"
- **IPv6 issue**: Try connection pooler URL (port 6543)
- **Firewall**: Ensure Supabase project allows connections
- **Password**: Verify password is correct (no spaces)

### Error: "Tenant or user not found"
- **Wrong format**: Get exact URL from Supabase dashboard
- **Project paused**: Check if Supabase project is active

### Error: "SSL required"
- Add `?sslmode=require` to connection string

## Next Steps After Database Setup

1. ✅ Database connected
2. Run `npx prisma generate` - Generate Prisma client
3. Run `npx prisma db push` - Create tables
4. Run `npm run dev` - Start development server
5. Visit http://localhost:3000
6. Create your first account via sign up page

## Current .env Status

Your `.env` file is created with:
- ✅ Database URL (needs verification)
- ✅ NextAuth secret (generated)
- ⏳ GitHub OAuth (needs credentials)
- ⏳ Stripe keys (needs credentials)
- ⏳ OpenAI key (needs credentials)
- ⏳ Resend key (needs credentials)

You can start developing without the optional services (GitHub, Stripe, etc.) - they're only needed for specific features.
