#!/usr/bin/env node
/**
 * e2e-smoke.mjs — Headless E2E smoke tests using fetch (no browser needed).
 *
 * Tests API endpoints, auth flows, and provider gating behavior.
 * Requires the dev server running on localhost:3000.
 *
 * Usage: node scripts/e2e-smoke.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
let pass = 0;
let fail = 0;

async function smoke(name, fn) {
  try {
    const result = await fn();
    if (result.pass) {
      pass++;
      console.log(`  ✅ ${name}`);
    } else {
      fail++;
      console.log(`  ❌ ${name}: ${result.detail}`);
    }
    results.push({ name, ...result });
  } catch (err) {
    fail++;
    const detail = err.message.slice(0, 200);
    console.log(`  ❌ ${name}: ${detail}`);
    results.push({ name, pass: false, detail });
  }
}

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual', ...opts });
  const body = res.headers.get('content-type')?.includes('json')
    ? await res.json().catch(() => null)
    : null;
  return { status: res.status, headers: res.headers, body };
}

// ── Health & Readiness ─────────────────────────────────────────────
console.log('\n═══ Health & Readiness ═══');

await smoke('GET /api/health → 200', async () => {
  const { status, body } = await fetchJSON('/api/health');
  return { pass: status === 200 && body?.status === 'ok', detail: `status=${status} body.status=${body?.status}` };
});

await smoke('GET /api/ready → 200 + db ok', async () => {
  const { status, body } = await fetchJSON('/api/ready');
  return { pass: status === 200 && body?.checks?.database === 'ok', detail: `status=${status} db=${body?.checks?.database}` };
});

await smoke('GET /api/capabilities → 200 + valid shape', async () => {
  const { status, body } = await fetchJSON('/api/capabilities');
  const hasKeys = body && typeof body.ai === 'boolean' && typeof body.billing === 'boolean';
  return { pass: status === 200 && hasKeys, detail: `status=${status} keys=${hasKeys}` };
});

// ── Auth Gating ────────────────────────────────────────────────────
console.log('\n═══ Auth Gating ═══');

await smoke('GET /dashboard → redirects to sign-in (307)', async () => {
  const res = await fetch(`${BASE}/dashboard`, { redirect: 'manual' });
  return { pass: res.status === 307, detail: `status=${res.status} location=${res.headers.get('location')?.slice(0, 60)}` };
});

await smoke('GET /api/qr-codes → auth-gated (unauthenticated)', async () => {
  const res = await fetch(`${BASE}/api/qr-codes`, { redirect: 'manual' });
  return { pass: res.status === 401 || res.status === 307, detail: `status=${res.status}` };
});

await smoke('GET /api/landing-pages → auth-gated (unauthenticated)', async () => {
  const res = await fetch(`${BASE}/api/landing-pages`, { redirect: 'manual' });
  return { pass: res.status === 401 || res.status === 307, detail: `status=${res.status}` };
});

await smoke('POST /api/ai/generate → auth-gated (unauthenticated)', async () => {
  const res = await fetch(`${BASE}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature: 'test', context: {} }),
    redirect: 'manual',
  });
  return { pass: res.status === 401 || res.status === 307, detail: `status=${res.status}` };
});

await smoke('POST /api/billing/checkout → auth-gated (unauthenticated)', async () => {
  const res = await fetch(`${BASE}/api/billing/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'PRO' }),
    redirect: 'manual',
  });
  return { pass: res.status === 401 || res.status === 307, detail: `status=${res.status}` };
});

// ── Admin Restriction ──────────────────────────────────────────────
console.log('\n═══ Admin Restrictions ═══');

await smoke('POST /api/admin/orders/fake/ship → auth-gated (unauthenticated)', async () => {
  const res = await fetch(`${BASE}/api/admin/orders/fake-id/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackingNumber: 'TEST123' }),
    redirect: 'manual',
  });
  return { pass: res.status === 401 || res.status === 307, detail: `status=${res.status}` };
});

// ── Security Headers ───────────────────────────────────────────────
console.log('\n═══ Security Headers ═══');

await smoke('Security headers present on public route', async () => {
  const res = await fetch(`${BASE}/api/health`);
  const csp = res.headers.get('content-security-policy');
  const xfo = res.headers.get('x-frame-options');
  const xcto = res.headers.get('x-content-type-options');
  const reqId = res.headers.get('x-request-id');
  const allPresent = !!csp && !!xfo && !!xcto;
  return {
    pass: allPresent,
    detail: `CSP=${!!csp} XFO=${!!xfo} XCTO=${!!xcto} RequestID=${!!reqId}`,
  };
});

// ── Concurrent Load Smoke ──────────────────────────────────────────
console.log('\n═══ Concurrent Load Smoke ═══');

await smoke('10 concurrent /api/health requests — no 5xx', async () => {
  const requests = Array.from({ length: 10 }, () => fetch(`${BASE}/api/health`));
  const responses = await Promise.all(requests);
  const statuses = responses.map(r => r.status);
  const all200 = statuses.every(s => s === 200);
  return { pass: all200, detail: `statuses: ${[...new Set(statuses)].join(',')}` };
});

await smoke('10 concurrent /api/ready requests — no 5xx', async () => {
  const requests = Array.from({ length: 10 }, () => fetch(`${BASE}/api/ready`));
  const responses = await Promise.all(requests);
  const statuses = responses.map(r => r.status);
  const no5xx = statuses.every(s => s < 500);
  return { pass: no5xx, detail: `statuses: ${[...new Set(statuses)].join(',')}` };
});

// ── Public Routes ──────────────────────────────────────────────────
console.log('\n═══ Public Routes ═══');

await smoke('GET / → 200 (landing page)', async () => {
  const res = await fetch(`${BASE}/`, { redirect: 'manual' });
  return { pass: res.status === 200, detail: `status=${res.status}` };
});

await smoke('GET /auth/signin → 200', async () => {
  const res = await fetch(`${BASE}/auth/signin`, { redirect: 'manual' });
  return { pass: res.status === 200, detail: `status=${res.status}` };
});

await smoke('GET /pricing → 200', async () => {
  const res = await fetch(`${BASE}/pricing`, { redirect: 'manual' });
  return { pass: res.status === 200, detail: `status=${res.status}` };
});

// ═══ SUMMARY ═══════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`E2E SMOKE: ${pass} PASS / ${fail} FAIL / ${results.length} TOTAL`);
console.log(fail === 0 ? '✅ ALL PASSED' : '❌ FAILURES DETECTED');
process.exit(fail === 0 ? 0 : 1);
