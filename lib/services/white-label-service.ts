import { prisma } from '@/lib/prisma';

export interface BrandingConfig {
  logo: {
    url: string;
    favicon?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  companyName: string;
  tagline?: string;
  supportEmail: string;
  website?: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromName: string;
  fromEmail: string;
}

export async function getBrandingForDomain(domain: string): Promise<BrandingConfig | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { customDomain: domain },
    });

    if (!org || !org.isWhiteLabel) {
      return null;
    }

    return org.branding as unknown as BrandingConfig;
  } catch (error) {
    console.error('Error fetching branding for domain:', error);
    return null;
  }
}

export async function getBrandingForOrganization(organizationId: string): Promise<BrandingConfig | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.isWhiteLabel) {
      return null;
    }

    return org.branding as unknown as BrandingConfig;
  } catch (error) {
    console.error('Error fetching branding for organization:', error);
    return null;
  }
}

export async function updateBranding(
  organizationId: string,
  branding: Partial<BrandingConfig>
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { branding: branding as any },
  });
}

export async function setCustomDomain(
  organizationId: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  // Validate domain format
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
  if (!domainRegex.test(domain)) {
    return { success: false, error: 'Invalid domain format' };
  }

  // Check if domain is already in use
  const existing = await prisma.organization.findFirst({
    where: { 
      customDomain: domain,
      id: { not: organizationId }
    },
  });

  if (existing) {
    return { success: false, error: 'Domain already in use' };
  }

  // Update organization with custom domain
  await prisma.organization.update({
    where: { id: organizationId },
    data: { customDomain: domain },
  });

  return { success: true };
}

export async function removeDomain(organizationId: string): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { customDomain: null },
  });
}

export async function updateSMTPConfig(
  organizationId: string,
  smtpConfig: SMTPConfig
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { smtpConfig: smtpConfig as any },
  });
}

export async function getSMTPConfig(organizationId: string): Promise<SMTPConfig | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { smtpConfig: true },
  });

  return org?.smtpConfig as SMTPConfig | null;
}

export async function updateRevenueShare(
  organizationId: string,
  revenueShare: number
): Promise<void> {
  if (revenueShare < 0 || revenueShare > 100) {
    throw new Error('Revenue share must be between 0 and 100');
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { revenueShare },
  });
}

export async function enableWhiteLabel(organizationId: string): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { isWhiteLabel: true },
  });
}

export async function disableWhiteLabel(organizationId: string): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { 
      isWhiteLabel: false,
      customDomain: null,
      branding: undefined,
      smtpConfig: undefined,
    },
  });
}

export function getDefaultBranding(): BrandingConfig {
  return {
    logo: {
      url: '/logo.png',
    },
    colors: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#EC4899',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    companyName: 'Qreate Studios',
    supportEmail: 'support@qreatestudios.com',
  };
}

export function validateBranding(branding: Partial<BrandingConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (branding.companyName && branding.companyName.length > 100) {
    errors.push('Company name too long (max 100 characters)');
  }

  if (branding.supportEmail && !isValidEmail(branding.supportEmail)) {
    errors.push('Invalid support email format');
  }

  if (branding.colors) {
    const colorFields = ['primary', 'secondary', 'accent', 'background', 'text'];
    for (const field of colorFields) {
      const color = (branding.colors as any)[field];
      if (color && !isValidHexColor(color)) {
        errors.push(`Invalid ${field} color format (must be hex)`);
      }
    }
  }

  if (branding.logo?.url && !isValidUrl(branding.logo.url)) {
    errors.push('Invalid logo URL');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function getSubAccountsCount(organizationId: string): Promise<number> {
  return await prisma.user.count({
    where: {
      parentOrganizationId: organizationId,
      isSubAccount: true,
    },
  });
}

export async function getWhiteLabelStats(organizationId: string): Promise<{
  subAccountsCount: number;
  qrCodesCount: number;
  totalScans: number;
  revenue: number;
}> {
  const [subAccountsCount, members] = await Promise.all([
    prisma.user.count({
      where: {
        parentOrganizationId: organizationId,
        isSubAccount: true,
      },
    }),
    prisma.organizationMember.findMany({
      where: { organizationId },
      select: { userId: true },
    }),
  ]);

  const userIds = members.map(m => m.userId);

  const [qrCodesCount, analytics] = await Promise.all([
    prisma.qRCode.count({
      where: { userId: { in: userIds } },
    }),
    prisma.analytics.count({
      where: {
        qrCode: {
          userId: { in: userIds },
        },
      },
    }),
  ]);

  return {
    subAccountsCount,
    qrCodesCount,
    totalScans: analytics,
    revenue: 0, // TODO: Calculate from billing records
  };
}
