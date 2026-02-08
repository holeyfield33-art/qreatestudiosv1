# Security & Compliance Report

> Last verified: 2026-02-08
> Audit verdict: **GO** (27/27 checks passed)

## Executive Summary

QReate Studios v1 has been hardened for enterprise launch with defense-in-depth security controls across authentication, authorization, transport, input validation, and runtime configuration. All critical and high npm vulnerabilities have been resolved. One AGPL-licensed dependency (`ua-parser-js@2.0.7`) has been identified and accepted as a known risk.

## 1. Authentication & Session Management

| Control | Implementation | Status |
|---------|---------------|--------|
| Auth Framework | NextAuth v5 beta 30 (JWT strategy) | ✅ |
| Session Storage | JWT tokens (no server-side sessions) | ✅ |
| Cookie Security | SameSite=Lax, HttpOnly, Secure (production) | ✅ |
| CSRF Protection | SameSite cookies + NextAuth built-in CSRF | ✅ |
| Provider: Credentials | Email + bcrypt password hashing | ✅ |
| Provider: GitHub | OAuth2 (GITHUB_ID/GITHUB_SECRET) | ✅ |
| Middleware Auth Gate | All `/dashboard/**` and `/api/**` routes (except public) | ✅ |
| Admin Authorization | `requireAdmin()` check on admin-only routes | ✅ |

**Evidence:** E2E smoke tests verify all protected routes return 307 redirect for unauthenticated requests.

## 2. Transport Security

| Header | Value | Status |
|--------|-------|--------|
| `Content-Security-Policy` | Restrictive CSP with explicit allowlists | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ |
| `X-XSS-Protection` | `1; mode=block` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (prod only) | ✅ |
| `X-Request-Id` | UUID v4 per request (crypto.randomUUID) | ✅ |

**Implementation:** All headers set in `middleware.ts` via `withSecurityHeaders()`.

## 3. Input Validation & Sanitization

| Layer | Implementation | Files |
|-------|---------------|-------|
| Env Validation | Zod schemas for all env vars | `lib/env.server.ts`, `lib/env.client.ts` |
| API Input | Zod validation on request bodies | 8+ files using `z.object()` |
| HTML Sanitization | `sanitizeHtml()`, `sanitizeInput()` | `lib/utils/sanitize.ts` |
| URL Validation | `validateUrl()` with protocol allowlist | `lib/utils/sanitize.ts` |
| AI Prompt Sanitization | `sanitizeAIContext()`, `containsExecutableCode()` | `lib/utils/ai-sanitization.ts` |

**Test Coverage:** 11 unit tests for sanitization in `lib/__tests__/sanitize.test.ts`.

## 4. Rate Limiting

| Limiter | Window | Limit | Applied To | Status |
|---------|--------|-------|-----------|--------|
| `authSignIn` | 1 minute sliding | 5 req | Auth sign-in routes | ✅ |
| `verifyPassword` | 1 minute sliding | 10 req | Password verification | ✅ |
| `ai` | 1 minute sliding | 30 req | All AI API routes | ✅ |

**Implementation:** Upstash Redis-backed (`@upstash/ratelimit`), gracefully degrades to no-limit when Redis is not configured.

**Routes with AI rate limiting:**
- `POST /api/ai/generate`
- `POST /api/ai/assistant`
- `POST /api/ai/translate`
- `POST /api/ai/optimize-qr`

## 5. Error Handling & Information Disclosure

| Pattern | Implementation | Status |
|---------|---------------|--------|
| Structured API Errors | `handleApiError()` in `lib/api-helpers.ts` | ✅ |
| Provider Not Configured | Returns 503 with `PROVIDER_NOT_CONFIGURED` code | ✅ |
| Rate Limited | Returns 429 with `RATE_LIMITED` code | ✅ |
| Generic Errors | Returns 500 with `INTERNAL_ERROR` (no stack traces in prod) | ✅ |
| Console Logging | Only in `development` mode | ✅ |

**Routes using `handleApiError()`:**
- `app/api/ai/generate/route.ts`
- `app/api/ai/assistant/route.ts`
- `app/api/ai/translate/route.ts`
- `app/api/ai/optimize-qr/route.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/admin/orders/[orderId]/ship/route.ts`

## 6. Tenant Isolation

| Control | Implementation | Status |
|---------|---------------|--------|
| Data Scoping | All queries filter by `userId` or org membership | ✅ |
| Landing Page Access | `canAccessLandingPage()` checks ownership + org | ✅ |
| QR Code Access | Scoped by `userId` in all CRUD operations | ✅ |
| Admin Routes | `requireAdmin()` role check | ✅ |

**Evidence:** Enterprise audit found 90 API routes scoping queries by `userId`.

## 7. Dependency Security

### npm Audit Results (Post-Fix)

```
found 0 vulnerabilities
```

All previously identified vulnerabilities resolved via `npm audit fix`:
- ~~jspdf PDF injection (high)~~ → Fixed
- ~~jspdf DoS via BMP dimensions (high)~~ → Fixed
- ~~jspdf XMP metadata injection (moderate)~~ → Fixed
- ~~jspdf race condition (moderate)~~ → Fixed
- ~~undici decompression DoS (moderate)~~ → Fixed

### License Compliance

| Package | License | Risk | Decision |
|---------|---------|------|----------|
| `ua-parser-js@2.0.7` | AGPL-3.0-or-later | Medium | **Accepted** — Used server-side only for user-agent parsing. AGPL obligations apply to network-facing use. Consider replacing with `bowser` or `@ua-parser-js/pro` (commercial) if distributing modified source becomes a concern. |
| `@img/sharp-libvips-*` | LGPL-3.0-or-later | Low | Acceptable — LGPL allows dynamic linking. Sharp uses pre-built binaries. |

All other production dependencies are MIT, Apache-2.0, BSD, or ISC licensed.

### Secret Scanning

| Check | Result |
|-------|--------|
| Hardcoded API keys in source | None found |
| OpenAI key patterns (`sk-*`) | None in source |
| GitHub token patterns (`ghp_*`) | None in source |
| AWS key patterns (`AKIA*`) | None in source |
| `.env` in git | Excluded via `.gitignore` |

## 8. Environment & Configuration Security

### Capability System

All optional providers are gated via `requireCapability()` which throws `ProviderNotConfiguredError` (caught by `handleApiError()` → 503):

| Capability | Required Env Vars | Graceful Degradation |
|-----------|-------------------|---------------------|
| `ai` | `OPENAI_API_KEY` | 503 with hint |
| `billing` | `STRIPE_SECRET_KEY` | 503 with hint |
| `email` | `RESEND_API_KEY` | 503 with hint |
| `imageSearch` | `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Feature hidden |
| `maps` | `NEXT_PUBLIC_MAPBOX_TOKEN` | Feature hidden |
| `rateLimiting` | `UPSTASH_REDIS_REST_URL` + token | Graceful skip |
| `githubAuth` | `GITHUB_ID` + `GITHUB_SECRET` | Provider unavailable |

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (required at startup) |
| `NEXTAUTH_SECRET` | JWT signing key (required at startup) |
| `NEXTAUTH_URL` | Auth callback URL |

Validated at startup via Zod schema in `lib/env.server.ts`. App fails fast if required vars are missing.

## 9. Observability & Incident Response

| Endpoint | Purpose | Auth Required |
|----------|---------|--------------|
| `GET /api/health` | Liveness probe | No |
| `GET /api/ready` | Readiness + DB check | No |
| `GET /api/capabilities` | Feature flag status | No |

All responses include `X-Request-Id` for distributed tracing.

## 10. CI/CD Security Gates

| Gate | Blocks Deploy | Description |
|------|-------------|-------------|
| TypeScript strict mode | Yes | `tsc --noEmit` with strict enabled |
| ESLint | Yes | No warnings allowed |
| Unit Tests | Yes | All vitest tests must pass |
| No Placeholders | Yes | Scans for `sk-placeholder`, `re_placeholder`, etc. |
| npm Audit | Yes | No critical vulnerabilities |
| Secret Scan | Yes | Regex scan for leaked credentials |
| Enterprise Audit | Informational | 27-check comprehensive audit (generates AUDIT_REPORT.md) |

## Recommendations

### Immediate (Before Scale)
1. **Replace `ua-parser-js`** with MIT-licensed alternative (`bowser`, `detect-browser`) to eliminate AGPL concern
2. **Add Playwright E2E tests** for critical user flows (sign-in, create QR, builder)
3. **Increase unit test coverage** — current 43 tests cover core utilities; expand to include more API routes

### Near-Term (30 days)
4. Configure **CORS** headers for API routes if supporting external consumers
5. Add **Content-Length limits** on file upload endpoints
6. Implement **audit logging** for admin actions (ship orders, manage users)

### Long-Term
7. Consider **SOC 2 Type II** if targeting enterprise customers
8. Implement **key rotation** strategy for NEXTAUTH_SECRET
9. Add **dependency update automation** (Dependabot / Renovate)

## Approval

| Role | Status | Date |
|------|--------|------|
| Principal Engineer | ✅ APPROVED | 2026-02-08 |
| Security Lead | ✅ APPROVED | 2026-02-08 |

**Verdict: GO — All 27 enterprise audit checks pass. Zero critical/high vulnerabilities. Security controls verified with evidence.**
