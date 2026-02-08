import { describe, it, expect } from 'vitest';
import { getFeatureAccess, hasFeatureAccess, isWithinLimit } from '@/lib/utils/feature-access';

describe('Feature Access', () => {
  describe('getFeatureAccess', () => {
    it('FREE plan has correct limits', () => {
      const access = getFeatureAccess('FREE');
      expect(access.maxQRCodes).toBe(3);
      expect(access.maxTeamSeats).toBe(1);
      expect(access.canAccessWhiteLabel).toBe(false);
      expect(access.canUseAIOptimization).toBe(false);
    });

    it('PRO plan has correct limits', () => {
      const access = getFeatureAccess('PRO');
      expect(access.maxQRCodes).toBe(50);
      expect(access.canUseAIOptimization).toBe(true);
      expect(access.canAccessWhiteLabel).toBe(false);
    });

    it('BUSINESS plan has unlimited QR codes', () => {
      const access = getFeatureAccess('BUSINESS');
      expect(access.maxQRCodes).toBe(-1);
      expect(access.maxTeamSeats).toBe(10);
      expect(access.canAccessPremiumTemplates).toBe(true);
    });

    it('AGENCY plan has all features', () => {
      const access = getFeatureAccess('AGENCY');
      expect(access.maxQRCodes).toBe(-1);
      expect(access.maxTeamSeats).toBe(-1);
      expect(access.canAccessWhiteLabel).toBe(true);
      expect(access.canUseCustomDomain).toBe(true);
      expect(access.canManageSubAccounts).toBe(true);
    });
  });

  describe('hasFeatureAccess', () => {
    it('returns true for features included in plan', () => {
      expect(hasFeatureAccess('AGENCY', 'canAccessWhiteLabel')).toBe(true);
      expect(hasFeatureAccess('PRO', 'canUseAIOptimization')).toBe(true);
    });

    it('returns false for features not included in plan', () => {
      expect(hasFeatureAccess('FREE', 'canAccessWhiteLabel')).toBe(false);
      expect(hasFeatureAccess('FREE', 'canUseAIOptimization')).toBe(false);
    });
  });

  describe('isWithinLimit', () => {
    it('returns true when under limit', () => {
      expect(isWithinLimit('FREE', 'maxQRCodes', 2)).toBe(true);
    });

    it('returns false when at limit', () => {
      expect(isWithinLimit('FREE', 'maxQRCodes', 3)).toBe(false);
    });

    it('returns true for unlimited plans', () => {
      expect(isWithinLimit('BUSINESS', 'maxQRCodes', 1000)).toBe(true);
    });
  });
});
