import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Liveness probe — returns 200 if the process is alive.
 * Use for container/orchestrator health checks.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
