export type PlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'AGENCY';

export interface FeatureAccess {
  canAccessAdvancedAnalytics: boolean;
  canExportReports: boolean;
  canAccessTemplates: boolean;
  canAccessPremiumTemplates: boolean;
  canAccessWhiteLabel: boolean;
  canUseCustomDomain: boolean;
  canManageSubAccounts: boolean;
  canUseAIOptimization: boolean;
  maxQRCodes: number;
  maxTeamSeats: number;
}

export function getFeatureAccess(plan: PlanType): FeatureAccess {
  const features: Record<PlanType, FeatureAccess> = {
    FREE: {
      canAccessAdvancedAnalytics: false,
      canExportReports: false,
      canAccessTemplates: true,
      canAccessPremiumTemplates: false,
      canAccessWhiteLabel: false,
      canUseCustomDomain: false,
      canManageSubAccounts: false,
      canUseAIOptimization: false,
      maxQRCodes: 3,
      maxTeamSeats: 1,
    },
    PRO: {
      canAccessAdvancedAnalytics: true,
      canExportReports: true,
      canAccessTemplates: true,
      canAccessPremiumTemplates: false,
      canAccessWhiteLabel: false,
      canUseCustomDomain: false,
      canManageSubAccounts: false,
      canUseAIOptimization: true,
      maxQRCodes: 50,
      maxTeamSeats: 1,
    },
    BUSINESS: {
      canAccessAdvancedAnalytics: true,
      canExportReports: true,
      canAccessTemplates: true,
      canAccessPremiumTemplates: true,
      canAccessWhiteLabel: false,
      canUseCustomDomain: false,
      canManageSubAccounts: false,
      canUseAIOptimization: true,
      maxQRCodes: -1, // unlimited
      maxTeamSeats: 5,
    },
    AGENCY: {
      canAccessAdvancedAnalytics: true,
      canExportReports: true,
      canAccessTemplates: true,
      canAccessPremiumTemplates: true,
      canAccessWhiteLabel: true,
      canUseCustomDomain: true,
      canManageSubAccounts: true,
      canUseAIOptimization: true,
      maxQRCodes: -1,
      maxTeamSeats: -1,
    },
  };

  return features[plan];
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(
  plan: PlanType,
  feature: keyof Omit<FeatureAccess, 'maxQRCodes' | 'maxTeamSeats'>
): boolean {
  const access = getFeatureAccess(plan);
  return access[feature];
}

/**
 * Get the limit for a numeric feature (QR codes or team seats)
 * Returns -1 for unlimited
 */
export function getFeatureLimit(
  plan: PlanType,
  limitType: 'maxQRCodes' | 'maxTeamSeats'
): number {
  const access = getFeatureAccess(plan);
  return access[limitType];
}

/**
 * Check if a count is within the plan's limit
 * Returns true if unlimited (-1) or under limit
 */
export function isWithinLimit(plan: PlanType, limitType: 'maxQRCodes' | 'maxTeamSeats', currentCount: number): boolean {
  const limit = getFeatureLimit(plan, limitType);
  return limit === -1 || currentCount < limit;
}
