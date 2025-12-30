import { auth } from '@/auth';
import { getFeatureAccess, hasFeatureAccess, type PlanType, type FeatureAccess } from '@/lib/utils/feature-access';

/**
 * Server-side hook to get current user's feature access
 * Use in Server Components and API routes
 */
export async function getServerFeatureAccess(): Promise<{
  plan: PlanType;
  features: FeatureAccess;
  hasFeature: (feature: keyof Omit<FeatureAccess, 'maxQRCodes' | 'maxTeamSeats'>) => boolean;
}> {
  const session = await auth();
  const plan = (session?.user?.organization?.plan as PlanType) || 'FREE';
  const features = getFeatureAccess(plan);
  
  return {
    plan,
    features,
    hasFeature: (feature) => hasFeatureAccess(plan, feature),
  };
}

/**
 * Enforce feature access - throws error if user doesn't have access
 * Use in API routes for protection
 */
export async function enforceFeatureAccess(
  feature: keyof Omit<FeatureAccess, 'maxQRCodes' | 'maxTeamSeats'>
): Promise<void> {
  const { hasFeature, plan } = await getServerFeatureAccess();
  
  if (!hasFeature(feature)) {
    throw new Error(`Feature '${feature}' requires a higher plan. Current plan: ${plan}`);
  }
}

/**
 * Check if user has access to a feature
 * Returns boolean instead of throwing
 */
export async function checkFeatureAccess(
  feature: keyof Omit<FeatureAccess, 'maxQRCodes' | 'maxTeamSeats'>
): Promise<boolean> {
  const { hasFeature } = await getServerFeatureAccess();
  return hasFeature(feature);
}
