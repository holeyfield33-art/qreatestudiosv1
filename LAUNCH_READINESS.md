# Launch Readiness Report

> Generated 2026-02-08 by `scripts/repo-audit.mjs`

## Summary

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 1 |

## Findings

| File | Line | Type | Severity | Detail | Fix Plan |
|------|------|------|----------|--------|----------|
| `app/api/stripe/webhook/route.ts` | 280 | debug-log | LOW | console.log in production code | Replace with structured logger or remove |

## Deletion Candidates (0 items)


## Secrets Required

### Required to Boot

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret |
| `NEXTAUTH_URL` | Canonical URL for NextAuth redirects |

### Optional (Feature-Gated)

| Variable | Feature | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | AI | OpenAI GPT-4o API access (AI features) |
| `STRIPE_SECRET_KEY` | Billing | Stripe billing integration |
| `STRIPE_WEBHOOK_SECRET` | Billing | Stripe webhook verification |
| `STRIPE_PRO_PRICE_ID` | Billing | Stripe Pro plan price |
| `STRIPE_BUSINESS_PRICE_ID` | Billing | Stripe Business plan price |
| `STRIPE_AGENCY_PRICE_ID` | Billing | Stripe Agency plan price |
| `RESEND_API_KEY` | Email | Resend transactional email |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Image Search | Unsplash image search |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Maps | Mapbox analytics heatmap |
| `UPSTASH_REDIS_REST_URL` | Rate Limiting | Upstash Redis for rate-limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Rate Limiting | Upstash Redis token |
| `GITHUB_ID` | GitHub Login | GitHub OAuth client ID |
| `GITHUB_SECRET` | GitHub Login | GitHub OAuth secret |
| `NEXT_PUBLIC_APP_URL` | Core | Public app URL for links |
| `FROM_EMAIL` | Email | Sender email address |
| `ADMIN_EMAIL` | Email | Admin notification email |
| `SUPPORT_EMAIL` | Email | Support email shown to users |

## Production Gating Behavior

| Provider | Missing Env | Server Behavior | UI Behavior |
|----------|-------------|-----------------|-------------|
| OpenAI | `OPENAI_API_KEY` | Returns 503 PROVIDER_NOT_CONFIGURED | AI buttons disabled + banner |
| Stripe | `STRIPE_SECRET_KEY` | Returns 503 PROVIDER_NOT_CONFIGURED | Billing buttons disabled + banner |
| Resend | `RESEND_API_KEY` | Logs warning, returns success:false | Email features show "not configured" |
| Unsplash | `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Returns fallback stock images | Seamless fallback |
| Mapbox | `NEXT_PUBLIC_MAPBOX_TOKEN` | N/A (client only) | Heatmap hidden |
| Redis | `UPSTASH_REDIS_REST_URL` | Rate-limiting disabled (passthrough) | Seamless |

## Ready to Launch Checklist

- [ ] All CRITICAL findings resolved
- [ ] All HIGH findings resolved
- [ ] Deletion candidates removed
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Health endpoint responds at /api/health
- [ ] Ready endpoint responds at /api/ready
- [ ] Capabilities endpoint responds at /api/capabilities
- [ ] Required env vars set in production
- [ ] Optional env vars documented in .env.example
