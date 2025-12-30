/**
 * Example usage of the plan-based feature access system
 * These examples demonstrate how to use feature access in various scenarios
 */

// ===================================
// 1. SERVER COMPONENT EXAMPLES
// ===================================

import { getServerFeatureAccess } from '@/lib/utils/feature-access-server';

/**
 * Example: Conditional rendering in Server Component
 */
export default async function DashboardPage() {
  const { features, plan } = await getServerFeatureAccess();
  
  return (
    <div>
      <h1>Dashboard - {plan} Plan</h1>
      
      {features.canAccessAdvancedAnalytics && (
        <AdvancedAnalyticsSection />
      )}
      
      {features.canExportReports && (
        <ExportButton />
      )}
      
      {!features.canUseAIOptimization && (
        <UpgradePrompt feature="AI Optimization" />
      )}
    </div>
  );
}

// ===================================
// 2. CLIENT COMPONENT EXAMPLES
// ===================================

'use client';

import { useFeatureAccess, useHasFeature } from '@/lib/hooks/use-feature-access';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Example: Feature-gated button
 */
export function AIOptimizeButton({ qrCodeId }: { qrCodeId: string }) {
  const { features, plan } = useFeatureAccess();
  
  if (!features.canUseAIOptimization) {
    return (
      <Button disabled>
        AI Optimize
        <Badge className="ml-2" variant="outline">PRO</Badge>
      </Button>
    );
  }
  
  return (
    <Button onClick={() => optimizeQRCode(qrCodeId)}>
      AI Optimize
    </Button>
  );
}

/**
 * Example: Using useHasFeature for simple checks
 */
export function ExportReportButton() {
  const canExport = useHasFeature('canExportReports');
  
  return (
    <Button disabled={!canExport}>
      {canExport ? 'Export Report' : 'Export (PRO Required)'}
    </Button>
  );
}

/**
 * Example: Feature access in form validation
 */
export function CreateQRCodeForm() {
  const { features, isLoading } = useFeatureAccess();
  const [qrCount, setQrCount] = useState(0);
  
  const canCreateMore = features.maxQRCodes === -1 || qrCount < features.maxQRCodes;
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>QR Codes: {qrCount} / {features.maxQRCodes === -1 ? '∞' : features.maxQRCodes}</p>
      
      <Button disabled={!canCreateMore}>
        Create QR Code
      </Button>
      
      {!canCreateMore && (
        <p className="text-sm text-red-600">
          Limit reached. Upgrade to create more QR codes.
        </p>
      )}
    </div>
  );
}

// ===================================
// 3. API ROUTE EXAMPLES
// ===================================

import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { enforceFeatureAccess, checkFeatureAccess } from '@/lib/utils/feature-access-server';

/**
 * Example: Protected API route with enforceFeatureAccess
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Throws error if user doesn't have access
    await enforceFeatureAccess('canExportReports');
    
    // Export logic here
    const report = await generateReport();
    
    return Response.json({ success: true, report });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 403 }
    );
  }
}

/**
 * Example: Optional feature with graceful fallback
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const hasAdvancedAnalytics = await checkFeatureAccess('canAccessAdvancedAnalytics');
  
  if (hasAdvancedAnalytics) {
    // Return detailed analytics
    const analytics = await getAdvancedAnalytics();
    return Response.json({ analytics, type: 'advanced' });
  } else {
    // Return basic analytics
    const analytics = await getBasicAnalytics();
    return Response.json({ analytics, type: 'basic' });
  }
}

// ===================================
// 4. SERVER ACTION EXAMPLES
// ===================================

'use server';

import { revalidatePath } from 'next/cache';

/**
 * Example: Server action with feature check
 */
export async function createQRCode(formData: FormData) {
  const { features, plan } = await getServerFeatureAccess();
  
  // Check limit
  const currentCount = await countUserQRCodes();
  if (features.maxQRCodes !== -1 && currentCount >= features.maxQRCodes) {
    return {
      error: `QR code limit reached (${features.maxQRCodes}). Upgrade to ${plan === 'FREE' ? 'PRO' : 'BUSINESS'} plan.`
    };
  }
  
  // Create QR code
  const qrCode = await prisma.qRCode.create({
    data: {
      // ... data
    }
  });
  
  revalidatePath('/dashboard/qr-codes');
  return { success: true, qrCode };
}

/**
 * Example: Server action with AI feature
 */
export async function optimizeQRCode(qrCodeId: string) {
  try {
    await enforceFeatureAccess('canUseAIOptimization');
    
    const optimization = await performAIOptimization(qrCodeId);
    
    return { success: true, optimization };
  } catch (error) {
    return { error: error.message };
  }
}

// ===================================
// 5. MIDDLEWARE EXAMPLES
// ===================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Example: Route protection in middleware
 * Note: Feature access in middleware requires different approach
 * since we can't use async auth() in Edge runtime
 */
export function middleware(request: NextRequest) {
  // This would need to decode JWT token to check plan
  // For simplicity, do feature checks in page/API instead
  
  // Redirect to upgrade page if accessing premium routes
  if (request.nextUrl.pathname.startsWith('/dashboard/white-label')) {
    // Check would happen in the page component
  }
  
  return NextResponse.next();
}

// ===================================
// 6. UTILITY COMPONENT EXAMPLES
// ===================================

/**
 * Example: Upgrade prompt component
 */
export function UpgradePrompt({ feature }: { feature: string }) {
  const { plan } = useFeatureAccess();
  
  const nextPlan = plan === 'FREE' ? 'PRO' : 
                   plan === 'PRO' ? 'BUSINESS' : 
                   'AGENCY';
  
  return (
    <div className="border rounded-lg p-4 bg-yellow-50">
      <h3 className="font-semibold">Upgrade Required</h3>
      <p className="text-sm text-gray-600">
        {feature} is available on {nextPlan} plan and above.
      </p>
      <Button asChild className="mt-2">
        <Link href="/pricing">Upgrade to {nextPlan}</Link>
      </Button>
    </div>
  );
}

/**
 * Example: Plan badge component
 */
export function PlanBadge() {
  const plan = usePlan();
  
  const colors = {
    FREE: 'bg-gray-100 text-gray-800',
    PRO: 'bg-blue-100 text-blue-800',
    BUSINESS: 'bg-purple-100 text-purple-800',
    AGENCY: 'bg-green-100 text-green-800',
  };
  
  return (
    <Badge className={colors[plan]}>
      {plan}
    </Badge>
  );
}

/**
 * Example: Feature limit indicator
 */
export function QRCodeLimitIndicator({ currentCount }: { currentCount: number }) {
  const { features } = useFeatureAccess();
  const limit = features.maxQRCodes;
  const percentage = limit === -1 ? 0 : (currentCount / limit) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>QR Codes</span>
        <span>{currentCount} / {limit === -1 ? '∞' : limit}</span>
      </div>
      {limit !== -1 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              percentage >= 90 ? 'bg-red-500' :
              percentage >= 70 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ===================================
// 7. CONDITIONAL NAVIGATION EXAMPLE
// ===================================

/**
 * Example: Dynamic sidebar based on features
 */
export function DynamicSidebar() {
  const { features } = useFeatureAccess();
  
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', show: true },
    { name: 'QR Codes', href: '/dashboard/qr-codes', show: true },
    { name: 'Analytics', href: '/dashboard/analytics', show: features.canAccessAdvancedAnalytics },
    { name: 'Templates', href: '/dashboard/templates', show: features.canAccessTemplates },
    { name: 'White-Label', href: '/dashboard/white-label', show: features.canAccessWhiteLabel },
    { name: 'Sub-Accounts', href: '/dashboard/sub-accounts', show: features.canManageSubAccounts },
  ].filter(item => item.show);
  
  return (
    <nav>
      {menuItems.map(item => (
        <Link key={item.href} href={item.href}>
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

// ===================================
// 8. FORM VALIDATION EXAMPLE
// ===================================

import { z } from 'zod';

/**
 * Example: Dynamic form validation based on features
 */
export function useQRCodeSchema() {
  const { features } = useFeatureAccess();
  
  return z.object({
    name: z.string().min(1),
    url: z.string().url(),
    hasLogo: z.boolean().refine(
      (val) => !val || features.maxQRCodes > 3,
      { message: 'Logo customization requires PRO plan' }
    ),
    customColors: z.boolean().refine(
      (val) => !val || features.maxQRCodes > 3,
      { message: 'Custom colors require PRO plan' }
    ),
  });
}

// ===================================
// 9. PRICING PAGE EXAMPLE
// ===================================

/**
 * Example: Highlight current plan on pricing page
 */
export function PricingCard({ planName, features }) {
  const { plan } = useFeatureAccess();
  const isCurrentPlan = plan === planName;
  
  return (
    <div className={`border rounded-lg p-6 ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
      <h3 className="text-xl font-bold">{planName}</h3>
      {isCurrentPlan && <Badge>Current Plan</Badge>}
      
      <ul>
        {features.map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      
      {!isCurrentPlan && (
        <Button>Upgrade to {planName}</Button>
      )}
    </div>
  );
}
