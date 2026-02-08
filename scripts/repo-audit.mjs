#!/usr/bin/env node
/**
 * repo-audit.mjs — Scans the codebase for launch-blocking issues.
 * Outputs a markdown report to /LAUNCH_READINESS.md
 *
 * Usage: node scripts/repo-audit.mjs
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const IGNORE_DIRS = new Set([
  'node_modules', '.next', '.git', '.vercel', 'coverage', 'dist',
  '.vscode', '.devcontainer',
]);
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

// ─── Patterns ──────────────────────────────────────────────────────
const PLACEHOLDER_PATTERNS = [
  { re: /['"]sk-placeholder['"]/g, label: 'OpenAI placeholder key' },
  { re: /['"]re_placeholder['"]/g, label: 'Resend placeholder key' },
  { re: /['"]sk_test_placeholder['"]/g, label: 'Stripe placeholder key' },
  { re: /throw new Error\(['"]TODO/gi, label: 'TODO throw' },
  { re: /\/\/\s*TODO(?!.*eslint)/gi, label: 'TODO comment' },
  { re: /\/\/\s*FIXME/gi, label: 'FIXME comment' },
  { re: /\/\/\s*HACK/gi, label: 'HACK comment' },
  { re: /\/\/\s*XXX/gi, label: 'XXX comment' },
  { re: /return null;\s*\/\/\s*(placeholder|stub|todo)/gi, label: 'Stub return null' },
];

const CONSOLE_LOG_RE = /console\.log\(/g;

// ─── Collector ─────────────────────────────────────────────────────
const findings = []; // { file, line, type, severity, detail, fixPlan }
const deletionCandidates = [];

async function walk(dir, cb) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, cb);
    } else if (CODE_EXTS.has(extname(e.name))) {
      await cb(full);
    }
  }
}

async function scanFile(filePath) {
  const rel = relative(ROOT, filePath);
  // Skip audit/verification scripts themselves (they contain search patterns)
  if (rel.startsWith('scripts/')) return;
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Placeholder patterns
    for (const { re, label } of PLACEHOLDER_PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line)) {
        findings.push({
          file: rel,
          line: lineNum,
          type: 'placeholder',
          severity: 'CRITICAL',
          detail: label,
          fixPlan: 'Replace with env validation + feature gating',
        });
      }
    }

    // console.log in non-script production code
    CONSOLE_LOG_RE.lastIndex = 0;
    if (CONSOLE_LOG_RE.test(line) && !rel.startsWith('scripts/')) {
      findings.push({
        file: rel,
        line: lineNum,
        type: 'debug-log',
        severity: 'LOW',
        detail: 'console.log in production code',
        fixPlan: 'Replace with structured logger or remove',
      });
    }
  });
}

// ─── Detect test/debug routes ──────────────────────────────────────
async function findTestRoutes() {
  const testRoutes = [
    'app/test-grapes',
    'app/test-mapbox',
    'app/dashboard/ui-test',
  ];
  for (const route of testRoutes) {
    try {
      await stat(join(ROOT, route));
      deletionCandidates.push(route);
      findings.push({
        file: route,
        line: '-',
        type: 'test-route',
        severity: 'HIGH',
        detail: 'Debug/test route accessible in production',
        fixPlan: 'Delete directory',
      });
    } catch { /* does not exist, fine */ }
  }
}

// ─── Detect orphan docs ────────────────────────────────────────────
async function findOrphanDocs() {
  const keepers = new Set(['README.md', 'LAUNCH_READINESS.md', 'LICENSE.md', 'CHANGELOG.md']);
  const entries = await readdir(ROOT);
  for (const e of entries) {
    if (e.endsWith('.md') && !keepers.has(e)) {
      deletionCandidates.push(e);
    }
    // Also flag stray non-essential files
    if (['debug-canvas.html', 'database-setup.sql', 'AUDIT_SUMMARY.txt'].includes(e)) {
      deletionCandidates.push(e);
    }
  }
}

// ─── Detect orphan example files ───────────────────────────────────
async function findOrphanExamples() {
  const candidates = ['lib/examples/feature-access-usage.tsx'];
  for (const c of candidates) {
    try {
      await stat(join(ROOT, c));
      deletionCandidates.push(c);
      findings.push({
        file: c,
        line: '-',
        type: 'orphan-example',
        severity: 'MEDIUM',
        detail: 'Example file not used in app',
        fixPlan: 'Delete',
      });
    } catch { /* noop */ }
  }
}

// ─── Env inventory ─────────────────────────────────────────────────
const ENV_VARS = {
  required: [
    { name: 'DATABASE_URL', purpose: 'PostgreSQL connection string' },
    { name: 'NEXTAUTH_SECRET', purpose: 'NextAuth JWT signing secret' },
    { name: 'NEXTAUTH_URL', purpose: 'Canonical URL for NextAuth redirects' },
  ],
  optional: [
    { name: 'OPENAI_API_KEY', purpose: 'OpenAI GPT-4o API access (AI features)', feature: 'AI' },
    { name: 'STRIPE_SECRET_KEY', purpose: 'Stripe billing integration', feature: 'Billing' },
    { name: 'STRIPE_WEBHOOK_SECRET', purpose: 'Stripe webhook verification', feature: 'Billing' },
    { name: 'STRIPE_PRO_PRICE_ID', purpose: 'Stripe Pro plan price', feature: 'Billing' },
    { name: 'STRIPE_BUSINESS_PRICE_ID', purpose: 'Stripe Business plan price', feature: 'Billing' },
    { name: 'STRIPE_AGENCY_PRICE_ID', purpose: 'Stripe Agency plan price', feature: 'Billing' },
    { name: 'RESEND_API_KEY', purpose: 'Resend transactional email', feature: 'Email' },
    { name: 'NEXT_PUBLIC_UNSPLASH_ACCESS_KEY', purpose: 'Unsplash image search', feature: 'Image Search' },
    { name: 'NEXT_PUBLIC_MAPBOX_TOKEN', purpose: 'Mapbox analytics heatmap', feature: 'Maps' },
    { name: 'UPSTASH_REDIS_REST_URL', purpose: 'Upstash Redis for rate-limiting', feature: 'Rate Limiting' },
    { name: 'UPSTASH_REDIS_REST_TOKEN', purpose: 'Upstash Redis token', feature: 'Rate Limiting' },
    { name: 'GITHUB_ID', purpose: 'GitHub OAuth client ID', feature: 'GitHub Login' },
    { name: 'GITHUB_SECRET', purpose: 'GitHub OAuth secret', feature: 'GitHub Login' },
    { name: 'NEXT_PUBLIC_APP_URL', purpose: 'Public app URL for links', feature: 'Core' },
    { name: 'FROM_EMAIL', purpose: 'Sender email address', feature: 'Email' },
    { name: 'ADMIN_EMAIL', purpose: 'Admin notification email', feature: 'Email' },
    { name: 'SUPPORT_EMAIL', purpose: 'Support email shown to users', feature: 'Email' },
  ],
};

// ─── Report generation ─────────────────────────────────────────────
async function generateReport() {
  const now = new Date().toISOString().slice(0, 10);

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  let md = `# Launch Readiness Report\n\n`;
  md += `> Generated ${now} by \`scripts/repo-audit.mjs\`\n\n`;
  md += `## Summary\n\n`;
  md += `| Severity | Count |\n|---|---|\n`;
  md += `| CRITICAL | ${criticalCount} |\n`;
  md += `| HIGH | ${highCount} |\n`;
  md += `| MEDIUM | ${mediumCount} |\n`;
  md += `| LOW | ${lowCount} |\n\n`;

  // ─── Findings table ───
  md += `## Findings\n\n`;
  md += `| File | Line | Type | Severity | Detail | Fix Plan |\n`;
  md += `|------|------|------|----------|--------|----------|\n`;
  for (const f of findings) {
    md += `| \`${f.file}\` | ${f.line} | ${f.type} | ${f.severity} | ${f.detail} | ${f.fixPlan} |\n`;
  }

  // ─── Deletion candidates ───
  md += `\n## Deletion Candidates (${deletionCandidates.length} items)\n\n`;
  for (const d of deletionCandidates.sort()) {
    md += `- \`${d}\`\n`;
  }

  // ─── Secrets required ───
  md += `\n## Secrets Required\n\n`;
  md += `### Required to Boot\n\n`;
  md += `| Variable | Purpose |\n|---|---|\n`;
  for (const v of ENV_VARS.required) {
    md += `| \`${v.name}\` | ${v.purpose} |\n`;
  }
  md += `\n### Optional (Feature-Gated)\n\n`;
  md += `| Variable | Feature | Purpose |\n|---|---|---|\n`;
  for (const v of ENV_VARS.optional) {
    md += `| \`${v.name}\` | ${v.feature} | ${v.purpose} |\n`;
  }

  // ─── Production Gating Behavior ───
  md += `\n## Production Gating Behavior\n\n`;
  md += `| Provider | Missing Env | Server Behavior | UI Behavior |\n`;
  md += `|----------|-------------|-----------------|-------------|\n`;
  md += `| OpenAI | \`OPENAI_API_KEY\` | Returns 503 PROVIDER_NOT_CONFIGURED | AI buttons disabled + banner |\n`;
  md += `| Stripe | \`STRIPE_SECRET_KEY\` | Returns 503 PROVIDER_NOT_CONFIGURED | Billing buttons disabled + banner |\n`;
  md += `| Resend | \`RESEND_API_KEY\` | Logs warning, returns success:false | Email features show "not configured" |\n`;
  md += `| Unsplash | \`NEXT_PUBLIC_UNSPLASH_ACCESS_KEY\` | Returns fallback stock images | Seamless fallback |\n`;
  md += `| Mapbox | \`NEXT_PUBLIC_MAPBOX_TOKEN\` | N/A (client only) | Heatmap hidden |\n`;
  md += `| Redis | \`UPSTASH_REDIS_REST_URL\` | Rate-limiting disabled (passthrough) | Seamless |\n`;

  // ─── Ready to Launch Checklist ───
  md += `\n## Ready to Launch Checklist\n\n`;
  md += `- [ ] All CRITICAL findings resolved\n`;
  md += `- [ ] All HIGH findings resolved\n`;
  md += `- [ ] Deletion candidates removed\n`;
  md += `- [ ] \`npm run build\` passes\n`;
  md += `- [ ] \`npm run lint\` passes\n`;
  md += `- [ ] \`npm run test\` passes\n`;
  md += `- [ ] Health endpoint responds at /api/health\n`;
  md += `- [ ] Ready endpoint responds at /api/ready\n`;
  md += `- [ ] Capabilities endpoint responds at /api/capabilities\n`;
  md += `- [ ] Required env vars set in production\n`;
  md += `- [ ] Optional env vars documented in .env.example\n`;

  return md;
}

// ─── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 Running repo audit...');

  await walk(ROOT, scanFile);
  await findTestRoutes();
  await findOrphanDocs();
  await findOrphanExamples();

  const report = await generateReport();
  const outPath = join(ROOT, 'LAUNCH_READINESS.md');
  await writeFile(outPath, report, 'utf-8');

  console.log(`\n✅ Audit complete. Report written to LAUNCH_READINESS.md`);
  console.log(`   CRITICAL: ${findings.filter(f => f.severity === 'CRITICAL').length}`);
  console.log(`   HIGH:     ${findings.filter(f => f.severity === 'HIGH').length}`);
  console.log(`   MEDIUM:   ${findings.filter(f => f.severity === 'MEDIUM').length}`);
  console.log(`   LOW:      ${findings.filter(f => f.severity === 'LOW').length}`);
  console.log(`   Deletion candidates: ${deletionCandidates.length}`);
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
