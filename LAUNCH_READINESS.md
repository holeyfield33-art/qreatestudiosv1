# Launch Readiness Report

> Generated 2026-02-08 by `scripts/repo-audit.mjs`

## Summary

| Severity | Count |
|---|---|
| CRITICAL | 7 |
| HIGH | 3 |
| MEDIUM | 1 |
| LOW | 1 |

## Findings

| File | Line | Type | Severity | Detail | Fix Plan |
|------|------|------|----------|--------|----------|
| `app/api/admin/orders/[orderId]/ship/route.ts` | 13 | placeholder | CRITICAL | Resend placeholder key | Replace with env validation + feature gating |
| `app/api/stripe/webhook/route.ts` | 280 | debug-log | LOW | console.log in production code | Replace with structured logger or remove |
| `lib/ai/ai-service.ts` | 10 | placeholder | CRITICAL | OpenAI placeholder key | Replace with env validation + feature gating |
| `lib/ai/qr-optimizer.ts` | 11 | placeholder | CRITICAL | OpenAI placeholder key | Replace with env validation + feature gating |
| `lib/services/ai-adapter.ts` | 9 | placeholder | CRITICAL | OpenAI placeholder key | Replace with env validation + feature gating |
| `lib/services/ai-optimization-service.ts` | 10 | placeholder | CRITICAL | OpenAI placeholder key | Replace with env validation + feature gating |
| `lib/services/email-service.ts` | 8 | placeholder | CRITICAL | Resend placeholder key | Replace with env validation + feature gating |
| `lib/services/stripe-service.ts` | 9 | placeholder | CRITICAL | Stripe placeholder key | Replace with env validation + feature gating |
| `app/test-grapes` | - | test-route | HIGH | Debug/test route accessible in production | Delete directory |
| `app/test-mapbox` | - | test-route | HIGH | Debug/test route accessible in production | Delete directory |
| `app/dashboard/ui-test` | - | test-route | HIGH | Debug/test route accessible in production | Delete directory |
| `lib/examples/feature-access-usage.tsx` | - | orphan-example | MEDIUM | Example file not used in app | Delete |

## Deletion Candidates (102 items)

- `ADD_WHITE_LABEL_TO_NAV.md`
- `ADVANCED_ANALYTICS_COMPLETE.md`
- `AI_ASSISTANT_SYSTEM_COMPLETE.md`
- `AI_COMPLETE_CHECKLIST.md`
- `AI_FINAL_DELIVERY.md`
- `AI_IMPLEMENTATION_SUMMARY.md`
- `AI_INTEGRATION_EXAMPLE.md`
- `AI_OPTIMIZATION_QUICK_START.md`
- `AI_OPTIMIZATION_SYSTEM_COMPLETE.md`
- `AI_QR_OPTIMIZATION_GUIDE.md`
- `AI_QUICK_START.md`
- `AI_STATUS.md`
- `AI_SYSTEM_COMPLETE.md`
- `ALL_TASKS_COMPLETE_SUMMARY.md`
- `ANALYTICS_QUICK_START.md`
- `ANALYTICS_SYSTEM_COMPLETE.md`
- `AUDIT_COMPLETE.md`
- `AUDIT_SUMMARY.txt`
- `BILLING_SYSTEM_COMPLETE.md`
- `BUILDER_ARCHITECTURE.md`
- `BUILDER_COMPLETE_CHECKLIST.md`
- `BUILDER_DEPLOYMENT_CHECKLIST.md`
- `BUILDER_FIX_COMPLETE.md`
- `BUILDER_FIX_SUMMARY.md`
- `BUILDER_QUICK_REF.md`
- `BUILDER_QUICK_START_GUIDE.md`
- `BUILDER_UPGRADE_README.md`
- `BUILDER_UPGRADE_SUMMARY.md`
- `CANVAS_FIX_QUICK_GUIDE.md`
- `COMPLETE_AUDIT_REPORT_JAN_2026.md`
- `COMPLETE_SYSTEM_AUDIT_2026.md`
- `COMPLETE_TESTING_EXECUTION_PLAN.md`
- `COMPREHENSIVE_AUDIT_REPORT.md`
- `CRITICAL_FIXES_COMPLETE.md`
- `DATABASE_SETUP.md`
- `DESIGN_SYSTEM.md`
- `DYNAMIC_QR_FORM_GUIDE.md`
- `ERROR_HANDLING_COMPLETE.md`
- `FEATURES.md`
- `FEATURE_ACCESS_QUICK_REF.md`
- `FINAL_INTEGRATION_SUMMARY.md`
- `FINAL_TASK_COMPLETION_REPORT.md`
- `FIXES_SUMMARY.md`
- `IMPLEMENTATION_GUIDE.md`
- `LANDING_PAGES_QUICK_START.md`
- `LANDING_PAGES_SYSTEM_COMPLETE.md`
- `LANDING_PAGE_SYSTEM_COMPLETE.md`
- `LAUNCH_READINESS_CHECKLIST.md`
- `MAPBOX_HEATMAP_GUIDE.md`
- `MAPBOX_IMPLEMENTATION_SUMMARY.md`
- `NFC_ORDERING_QUICK_START.md`
- `NFC_ORDERING_SYSTEM_COMPLETE.md`
- `NFC_ORDERING_TESTING_GUIDE.md`
- `PAYMENT_QR_FIX_COMPLETE.md`
- `PAYMENT_QR_TESTING_GUIDE.md`
- `PLAN_BASED_FEATURE_ACCESS.md`
- `PLATFORM_FEATURES_COMPLETE.md`
- `POLISH_LOADING_STATES_COMPLETE.md`
- `PREMIUM_EDITOR_ENABLED.md`
- `PREMIUM_LANDING_PAGE_COMPLETE.md`
- `PREMIUM_LANDING_PAGE_IMPLEMENTATION.md`
- `PRODUCTION_INFRASTRUCTURE_SETUP.md`
- `PRODUCTION_READY.md`
- `PROFESSIONAL_BUILDER_COMPLETE.md`
- `PROJECT_FEATURES.md`
- `PROJECT_STRUCTURE.md`
- `QR_LANDING_PAGE_UNIFIED_FLOW.md`
- `QR_LANDING_PRINT_FLOW_COMPLETE.md`
- `QR_SUCCESS_MODAL_COMPLETE.md`
- `QR_SYSTEM_COMPLETE.md`
- `QR_SYSTEM_DOCUMENTATION.md`
- `QR_TESTING_CHECKLIST.md`
- `QR_TYPE_EXAMPLES.md`
- `QUICK_REFERENCE.md`
- `QUICK_START.md`
- `RUNTIME_ERRORS_FIXED.md`
- `SECURITY_AUDIT_REPORT.md`
- `SETUP_COMPLETE.md`
- `SYSTEM_AUDIT_REPORT.md`
- `TEMPLATES_QUICK_START.md`
- `TEMPLATES_SYSTEM_COMPLETE.md`
- `TEMPLATE_CANVAS_FIX_COMPLETE.md`
- `TESTING_GUIDE_COMPLETE_FLOW.md`
- `TIER_ACCESS_QUICK_REF.md`
- `TIER_ACCESS_TESTING_GUIDE.md`
- `TIER_BASED_ACCESS_COMPLETE.md`
- `TIER_SYSTEM_ARCHITECTURE.md`
- `UI_UX_IMPROVEMENTS.md`
- `UNIFIED_FLOW_USER_JOURNEY.md`
- `VERCEL_DEPLOYMENT_GUIDE.md`
- `VISUAL_EDITOR_COMPLETE_GUIDE.md`
- `WHITE_LABEL_IMPLEMENTATION_SUMMARY.md`
- `WHITE_LABEL_NAV_IMPLEMENTATION.md`
- `WHITE_LABEL_QUICK_START.md`
- `WHITE_LABEL_SYSTEM_COMPLETE.md`
- `WIRING_COMPLETE.md`
- `app/dashboard/ui-test`
- `app/test-grapes`
- `app/test-mapbox`
- `database-setup.sql`
- `debug-canvas.html`
- `lib/examples/feature-access-usage.tsx`

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
