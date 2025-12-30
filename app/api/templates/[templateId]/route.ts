import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTemplateById } from '@/lib/templates/qr-templates';

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
      // TODO: Add subscription check here
      // const hasAccess = await checkPremiumAccess(session.user.id);
      // if (!hasAccess) {
      //   return NextResponse.json({ error: 'Premium template requires subscription' }, { status: 403 });
      // }
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}
