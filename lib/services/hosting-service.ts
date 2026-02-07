import { prisma } from '@/lib/prisma';

export interface DeploymentResult {
  success: boolean;
  url: string;
  version: number;
  deployedAt: string;
  error?: string;
}

export interface HostingConfig {
  slug: string;
  customDomain?: string | null;
  isPublished: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
}

/**
 * Deploy a landing page - copies draft to published, increments version
 */
export async function deployLandingPage(
  pageId: string,
  userId: string
): Promise<DeploymentResult> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return { success: false, url: '', version: 0, deployedAt: '', error: 'Page not found' };
  }

  if (page.userId !== userId) {
    return { success: false, url: '', version: 0, deployedAt: '', error: 'Unauthorized' };
  }

  if (!page.draftContent) {
    return { success: false, url: '', version: 0, deployedAt: '', error: 'No draft content to deploy' };
  }

  // Calculate version from metadata
  const metadata = (page.metadata as any) || {};
  const currentVersion = metadata.deploymentVersion || 0;
  const newVersion = currentVersion + 1;

  // Store previous version in metadata for rollback capability
  const deploymentHistory = metadata.deploymentHistory || [];
  if (page.publishedContent) {
    deploymentHistory.push({
      version: currentVersion,
      content: page.publishedContent,
      deployedAt: metadata.lastDeployedAt || page.publishedAt?.toISOString(),
    });
    // Keep only last 5 versions
    if (deploymentHistory.length > 5) {
      deploymentHistory.splice(0, deploymentHistory.length - 5);
    }
  }

  const now = new Date();

  const updated = await prisma.landingPage.update({
    where: { id: pageId },
    data: {
      publishedContent: page.draftContent as any,
      isPublished: true,
      publishedAt: now,
      metadata: {
        ...metadata,
        deploymentVersion: newVersion,
        lastDeployedAt: now.toISOString(),
        deploymentHistory,
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qreatestudios.com';
  const url = page.customDomain
    ? `https://${page.customDomain}`
    : `${baseUrl}/l/${page.slug}`;

  return {
    success: true,
    url,
    version: newVersion,
    deployedAt: now.toISOString(),
  };
}

/**
 * Rollback to a previous version
 */
export async function rollbackDeployment(
  pageId: string,
  userId: string,
  targetVersion?: number
): Promise<DeploymentResult> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page || page.userId !== userId) {
    return { success: false, url: '', version: 0, deployedAt: '', error: 'Page not found or unauthorized' };
  }

  const metadata = (page.metadata as any) || {};
  const history = metadata.deploymentHistory || [];

  if (history.length === 0) {
    return { success: false, url: '', version: 0, deployedAt: '', error: 'No previous versions available for rollback' };
  }

  // Find the target version or use the most recent one
  const targetEntry = targetVersion
    ? history.find((h: any) => h.version === targetVersion)
    : history[history.length - 1];

  if (!targetEntry) {
    return { success: false, url: '', version: 0, deployedAt: '', error: 'Target version not found' };
  }

  const now = new Date();

  await prisma.landingPage.update({
    where: { id: pageId },
    data: {
      publishedContent: targetEntry.content,
      draftContent: targetEntry.content,
      publishedAt: now,
      metadata: {
        ...metadata,
        deploymentVersion: targetEntry.version,
        lastDeployedAt: now.toISOString(),
        lastRollback: { from: metadata.deploymentVersion, to: targetEntry.version, at: now.toISOString() },
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qreatestudios.com';
  const url = page.customDomain
    ? `https://${page.customDomain}`
    : `${baseUrl}/l/${page.slug}`;

  return {
    success: true,
    url,
    version: targetEntry.version,
    deployedAt: now.toISOString(),
  };
}

/**
 * Unpublish a landing page
 */
export async function unpublishLandingPage(
  pageId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page || page.userId !== userId) {
    return { success: false, error: 'Page not found or unauthorized' };
  }

  await prisma.landingPage.update({
    where: { id: pageId },
    data: { isPublished: false },
  });

  return { success: true };
}

/**
 * Get hosting status for a landing page
 */
export async function getHostingStatus(
  pageId: string,
  userId: string
): Promise<HostingConfig | null> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
    select: {
      slug: true,
      customDomain: true,
      isPublished: true,
      metadata: true,
    },
  });

  if (!page) return null;

  return {
    slug: page.slug,
    customDomain: page.customDomain,
    isPublished: page.isPublished,
    sslStatus: page.customDomain ? 'active' : 'pending',
  };
}

/**
 * Get deployment history for a landing page
 */
export async function getDeploymentHistory(
  pageId: string,
  userId: string
): Promise<Array<{ version: number; deployedAt: string }>> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
    select: { metadata: true, userId: true },
  });

  if (!page || page.userId !== userId) return [];

  const metadata = (page.metadata as any) || {};
  const history = metadata.deploymentHistory || [];

  return history.map((h: any) => ({
    version: h.version,
    deployedAt: h.deployedAt,
  }));
}
