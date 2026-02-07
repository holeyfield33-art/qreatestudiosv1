export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTemplateById } from '@/lib/templates/qr-templates';
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user has access to premium templates
    if (template.isPremium) {
      const userPlan = (session.user.organization?.plan as PlanType) || 'FREE';
      const features = getFeatureAccess(userPlan);
      
      if (!features.canAccessPremiumTemplates) {
        return NextResponse.json({ 
          error: 'Premium template access requires BUSINESS or AGENCY plan',
          requiredPlan: 'BUSINESS',
          currentPlan: userPlan,
          upgradeUrl: '/pricing',
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    console.error('Error fetching template:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}
