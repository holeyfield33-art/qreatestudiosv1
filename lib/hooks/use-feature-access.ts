'use client';

import { useSession } from 'next-auth/react';
import { getFeatureAccess, hasFeatureAccess, type PlanType, type FeatureAccess } from '@/lib/utils/feature-access';

/**
 * Client-side hook to get current user's feature access
 * Use in Client Components
 */
export function useFeatureAccess() {
  const { data: session, status } = useSession();
  
  const plan = (session?.user?.organization?.plan as PlanType) || 'FREE';
  const features = getFeatureAccess(plan);
  
  const hasFeature = (feature: keyof Omit<FeatureAccess, 'maxQRCodes' | 'maxTeamSeats'>) => {
    return hasFeatureAccess(plan, feature);
  };
  
  return {
    plan,
    features,
    hasFeature,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}

/**
 * Client-side hook to check a specific feature
 * Returns boolean for easy conditional rendering
 */
export function useHasFeature(
  feature: keyof Omit<FeatureAccess, 'maxQRCodes' | 'maxTeamSeats'>
): boolean {
  const { hasFeature } = useFeatureAccess();
  return hasFeature(feature);
}

/**
 * Client-side hook to get plan info
 */
export function usePlan() {
  const { data: session } = useSession();
  return (session?.user?.organization?.plan as PlanType) || 'FREE';
}
