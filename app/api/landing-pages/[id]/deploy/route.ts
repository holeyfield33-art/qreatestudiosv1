import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { canAccessLandingPage } from '@/lib/utils/plan-enforcement';
import { deployLandingPage, rollbackDeployment, unpublishLandingPage, getHostingStatus, getDeploymentHistory } from '@/lib/services/hosting-service';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Deploy (publish) a landing page with versioning
export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check access (owner or org member)
    const hasAccess = await canAccessLandingPage(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'deploy';

    if (action === 'rollback') {
      const result = await rollbackDeployment(id, session.user.id, body.targetVersion);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, deployment: result });
    }

    if (action === 'unpublish') {
      const result = await unpublishLandingPage(id, session.user.id);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // Default: deploy
    const result = await deployLandingPage(id, session.user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, deployment: result });
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy' },
      { status: 500 }
    );
  }
}

// Get hosting status and deployment history
export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [status, history] = await Promise.all([
      getHostingStatus(id, session.user.id),
      getDeploymentHistory(id, session.user.id),
    ]);

    if (!status) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      hosting: status,
      history,
    });
  } catch (error) {
    console.error('Hosting status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get hosting status' },
      { status: 500 }
    );
  }
}
