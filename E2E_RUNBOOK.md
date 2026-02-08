# End-to-End Testing Runbook

> Last verified: 2026-02-08
> Status: **ALL 15 SMOKE TESTS PASSING**

## Quick Start

```bash
# Start dev server
npm run dev

# Run E2E smoke tests (API-based, no browser required)
node scripts/e2e-smoke.mjs

# Run enterprise audit (includes unit tests, build, security checks)
node scripts/enterprise-audit.mjs

# Run unit tests only
npm run test
```

## Test Inventory

### Unit Tests (Vitest) — 43 tests across 5 files

| File | Tests | Description |
|------|-------|-------------|
| `lib/__tests__/feature-access.test.ts` | 9 | Plan-based feature gating (FREE/PRO/BUSINESS/AGENCY) |
| `lib/__tests__/sanitize.test.ts` | 11 | XSS sanitization, URL validation, input cleaning |
| `lib/__tests__/rate-limit.test.ts` | 4 | In-memory rate limiter logic |
| `app/api/__tests__/landing-pages.test.ts` | 6 | Landing Pages CRUD (auth, 404, access control) |
| `app/dashboard/landing-pages/[id]/builder/page.test.tsx` | 13 | Builder page rendering, content changes, auto-save |

### E2E Smoke Tests (`scripts/e2e-smoke.mjs`) — 15 tests

| Category | Test | Expected |
|----------|------|----------|
| **Health & Readiness** | `GET /api/health` | 200 |
| | `GET /api/ready` | 200 + `db: true` |
| | `GET /api/capabilities` | 200 + valid shape (boolean flags) |
| **Auth Gating** | `GET /dashboard` | 307 redirect to `/auth/signin` |
| | `GET /api/qr-codes` | 307 or 401 (middleware redirect) |
| | `GET /api/landing-pages` | 307 or 401 |
| | `POST /api/ai/generate` | 307 or 401 |
| | `POST /api/billing/checkout` | 307 or 401 |
| **Admin** | `POST /api/admin/orders/fake/ship` | 307 or 401 |
| **Security Headers** | Public route headers | CSP, X-Frame-Options, X-Content-Type-Options, X-Request-Id |
| **Load** | 10 concurrent `/api/health` | No 5xx |
| | 10 concurrent `/api/ready` | No 5xx |
| **Public Routes** | `GET /` | 200 |
| | `GET /auth/signin` | 200 |
| | `GET /pricing` | 200 |

### Enterprise Audit (`scripts/enterprise-audit.mjs`) — 27 checks

Categories: Codebase Integrity (8), Dependencies (5), Environment (3), Functional Tests (2), Infrastructure (5), Security Controls (4).

See [AUDIT_REPORT.md](AUDIT_REPORT.md) for last run results.

## Running Tests

### Prerequisites

```bash
# Ensure dependencies are installed
npm ci

# Generate Prisma client
npx prisma generate

# Ensure database is running (for integration tests)
# DB connection via DATABASE_URL in .env
```

### Unit Tests

```bash
# Run once
npm run test

# Watch mode (development)
npm run test:watch

# Single file
npx vitest run lib/__tests__/sanitize.test.ts
```

### E2E Smoke Tests

Requires a running dev server at `http://localhost:3000`:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run smoke tests
node scripts/e2e-smoke.mjs

# Or with custom base URL:
BASE_URL=https://staging.example.com node scripts/e2e-smoke.mjs
```

### Full Enterprise Audit

```bash
node scripts/enterprise-audit.mjs
# Generates AUDIT_REPORT.md with GO/NO-GO verdict
```

## CI Pipeline

The GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs:

| Job | Trigger | Blocking |
|-----|---------|----------|
| `lint` | Push/PR | Yes |
| `test` | Push/PR | Yes |
| `typecheck` | Push/PR | Yes |
| `no-placeholders` | Push/PR | Yes |
| `build` | After lint+test | Yes |
| `audit` | After all above | No (informational) |
| `enterprise-audit` | After all above | No (informational) |
| `security-scan` | Push/PR | Yes (secrets check) |

## Adding New Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do the thing', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Adding E2E Smoke Tests

Edit `scripts/e2e-smoke.mjs` and add a new `smoke()` call:

```javascript
await smoke('Description of test', async () => {
  const res = await fetch(`${BASE}/api/your-endpoint`);
  return { pass: res.status === 200, detail: `status=${res.status}` };
});
```

## Monitoring & Observability

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Liveness probe | `{ status: 'ok', timestamp }` |
| `/api/ready` | Readiness probe (+ DB check) | `{ status: 'ready', db: true }` |
| `/api/capabilities` | Feature flag status | `{ ai, billing, email, ... }` |

All responses include `X-Request-Id` header for distributed tracing.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| E2E tests timeout | Dev server not running | Start with `npm run dev` |
| Auth tests fail with 500 | Database not connected | Check `DATABASE_URL` in `.env` |
| Rate limit tests fail | Redis not configured | Tests gracefully skip when Redis unavailable |
| Build fails in CI | Missing Prisma generate | Ensure `npx prisma generate` runs before build |
| 503 on AI endpoints | OpenAI key not set | Set `OPENAI_API_KEY` or ignore (graceful degradation) |
