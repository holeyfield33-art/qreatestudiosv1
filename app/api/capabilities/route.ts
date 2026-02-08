import { NextResponse } from 'next/server';
import { getCapabilities } from '@/lib/env.server';

/**
 * GET /api/capabilities
 *
 * Returns which optional features are available based on configured env vars.
 * No auth required — this is public so the UI can gate features before login.
 * No secrets are exposed; only boolean on/off per feature.
 */
export async function GET() {
  return NextResponse.json(getCapabilities(), {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  });
}
