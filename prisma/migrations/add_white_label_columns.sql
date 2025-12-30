-- White-Label Multi-Tenancy System Migration
-- Add white-label columns to Organization and User tables

-- Add white-label columns to Organization table
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "isWhiteLabel" BOOLEAN DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "customDomain" TEXT UNIQUE;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "branding" JSONB DEFAULT '{"companyName": "Qreate Studios", "logo": {"url": "/logo.png"}, "colors": {"primary": "#3b82f6", "secondary": "#1e40af", "accent": "#10b981"}, "supportEmail": "support@qreatestudios.com"}';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "smtpConfig" JSONB DEFAULT '{}';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "revenueShare" INTEGER DEFAULT 70;

-- Add sub-account columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "parentOrganizationId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSubAccount" BOOLEAN DEFAULT false;

-- Add foreign key constraint for parent organization
ALTER TABLE "User" ADD CONSTRAINT IF NOT EXISTS "User_parentOrganizationId_fkey" 
  FOREIGN KEY ("parentOrganizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

-- Create index for custom domain lookups (improves performance)
CREATE INDEX IF NOT EXISTS "Organization_customDomain_idx" ON "Organization"("customDomain");

-- Create index for parent organization lookups
CREATE INDEX IF NOT EXISTS "User_parentOrganizationId_idx" ON "User"("parentOrganizationId");

-- Comments for documentation
COMMENT ON COLUMN "Organization"."isWhiteLabel" IS 'Flag indicating if organization has white-label features enabled';
COMMENT ON COLUMN "Organization"."customDomain" IS 'Custom domain for white-label organizations (e.g., app.clientcompany.com)';
COMMENT ON COLUMN "Organization"."branding" IS 'JSONB object containing branding configuration: companyName, logo, colors, supportEmail';
COMMENT ON COLUMN "Organization"."smtpConfig" IS 'JSONB object containing custom SMTP configuration for email sending';
COMMENT ON COLUMN "Organization"."revenueShare" IS 'Percentage of revenue shared with agency (default 70%)';
COMMENT ON COLUMN "User"."parentOrganizationId" IS 'Reference to parent organization for sub-accounts';
COMMENT ON COLUMN "User"."isSubAccount" IS 'Flag indicating if user is a sub-account managed by a white-label organization';
