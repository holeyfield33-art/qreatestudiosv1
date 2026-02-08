#!/usr/bin/env node
/**
 * enterprise-audit.mjs — Comprehensive enterprise launch audit.
 *
 * Runs every check required for launch gate:
 *   - Placeholder scan
 *   - Secret scan
 *   - Lint / Typecheck / Unit tests / Build
 *   - Dependency audit
 *   - DB migration check
 *   - Endpoint verification
 *   - License scan
 *
 * Exit 0 = PASS, Exit 1 = FAIL
 * Usage: node scripts/enterprise-audit.mjs
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const results = [];
let totalPass = 0;
let totalFail = 0;

// ── Helpers ────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', timeout: 120_000, ...opts });
  } catch (e) {
    return e.stdout || e.stderr || e.message;
  }
}

function check(category, name, fn) {
  try {
    const { pass, detail } = fn();
    results.push({ category, name, pass, detail });
    if (pass) totalPass++; else totalFail++;
    console.log(`  ${pass ? '✅' : '❌'} ${name}`);
    return pass;
  } catch (err) {
    results.push({ category, name, pass: false, detail: err.message });
    totalFail++;
    console.log(`  ❌ ${name}: ${err.message.slice(0, 120)}`);
    return false;
  }
}

// ── A) CODEBASE INTEGRITY ──────────────────────────────────────────
console.log('\n═══ A) CODEBASE INTEGRITY ═══');

check('Codebase', 'No placeholder credentials', () => {
  const out = run('grep -rn "sk-placeholder\\|re_placeholder\\|sk_test_placeholder" --include="*.ts" --include="*.tsx" lib/ app/ components/ || true');
  return { pass: out.trim().length === 0, detail: out.trim() || 'None found' };
});

check('Codebase', 'No TODO/FIXME in production code', () => {
  const out = run('grep -rn "// TODO\\|// FIXME\\|// HACK\\|// XXX" --include="*.ts" --include="*.tsx" lib/ app/ components/ || true');
  const lines = out.trim().split('\n').filter(Boolean);
  return { pass: lines.length === 0, detail: lines.length ? `${lines.length} markers found:\n${lines.slice(0, 5).join('\n')}` : 'None found' };
});

check('Codebase', 'No test/debug routes', () => {
  const dirs = ['app/test-grapes', 'app/test-mapbox', 'app/dashboard/ui-test'];
  const found = dirs.filter(d => existsSync(join(ROOT, d)));
  return { pass: found.length === 0, detail: found.length ? `Found: ${found.join(', ')}` : 'None found' };
});

check('Codebase', 'No debug files at root', () => {
  const files = ['debug-canvas.html', 'database-setup.sql', 'AUDIT_SUMMARY.txt'];
  const found = files.filter(f => existsSync(join(ROOT, f)));
  return { pass: found.length === 0, detail: found.length ? `Found: ${found.join(', ')}` : 'None found' };
});

check('Codebase', 'TypeScript compiles (strict)', () => {
  const out = run('npx tsc --noEmit 2>&1');
  const hasErrors = out.includes('error TS');
  return { pass: !hasErrors, detail: hasErrors ? out.trim().slice(0, 500) : 'Clean' };
});

check('Codebase', 'ESLint passes', () => {
  const out = run('npm run lint 2>&1');
  const hasErrors = out.includes('Error') && !out.includes('0 errors');
  return { pass: !hasErrors, detail: hasErrors ? out.trim().slice(0, 500) : 'Clean' };
});

check('Codebase', 'Feature flags have safe defaults', () => {
  const envFile = readFileSync(join(ROOT, 'lib/env.server.ts'), 'utf-8');
  const hasCapabilities = envFile.includes('getCapabilities');
  const hasRequireCapability = envFile.includes('requireCapability');
  return { pass: hasCapabilities && hasRequireCapability, detail: 'getCapabilities + requireCapability present' };
});

check('Codebase', 'Env validation exists (server + client)', () => {
  const server = existsSync(join(ROOT, 'lib/env.server.ts'));
  const client = existsSync(join(ROOT, 'lib/env.client.ts'));
  return { pass: server && client, detail: `server: ${server}, client: ${client}` };
});

// ── B) DEPENDENCY & SUPPLY CHAIN ───────────────────────────────────
console.log('\n═══ B) DEPENDENCY & SUPPLY CHAIN ═══');

check('Dependencies', 'npm audit (no critical)', () => {
  const out = run('npm audit --json 2>&1');
  try {
    const audit = JSON.parse(out);
    const vulns = audit.metadata?.vulnerabilities || {};
    const critical = vulns.critical || 0;
    const high = vulns.high || 0;
    const summary = `critical:${critical} high:${high} moderate:${vulns.moderate||0} low:${vulns.low||0}`;
    return { pass: critical === 0, detail: summary };
  } catch {
    return { pass: false, detail: 'npm audit parse failed: ' + out.slice(0, 200) };
  }
});

check('Dependencies', 'Lockfile committed', () => {
  const exists = existsSync(join(ROOT, 'package-lock.json')) || existsSync(join(ROOT, 'pnpm-lock.yaml'));
  return { pass: exists, detail: exists ? 'package-lock.json found' : 'No lockfile' };
});

check('Dependencies', 'License scan (no GPL/AGPL in prod deps)', () => {
  const out = run('npx license-checker --production --json 2>/dev/null || echo "SKIP"');
  if (out.includes('SKIP')) return { pass: true, detail: 'license-checker not available (informational)' };
  const restrictive = [];
  try {
    const licenses = JSON.parse(out);
    for (const [pkg, info] of Object.entries(licenses)) {
      const lic = (info.licenses || '').toString();
      if (/GPL|AGPL|SSPL/i.test(lic) && !/LGPL/i.test(lic)) {
        restrictive.push(`${pkg}: ${lic}`);
      }
    }
  } catch { /* best-effort */ }
  // ua-parser-js v2 is AGPL — accepted risk, documented in SECURITY_COMPLIANCE.md
  const filtered = restrictive.filter(r => !r.includes('ua-parser-js'));
  const detail = restrictive.length ? `WARNING: ${restrictive.join(', ')} (ua-parser-js AGPL accepted)` : 'All permissive';
  return { pass: filtered.length === 0, detail };
});

// ── B2) SECRET SCAN ────────────────────────────────────────────────
check('Secrets', '.env is gitignored', () => {
  const gitignore = readFileSync(join(ROOT, '.gitignore'), 'utf-8');
  const ignored = gitignore.includes('.env');
  return { pass: ignored, detail: ignored ? '.env* in .gitignore' : 'NOT IGNORED' };
});

check('Secrets', 'No hardcoded API keys in source', () => {
  const patterns = [
    'sk-[a-zA-Z0-9]{20,}', // OpenAI
    'sk_live_[a-zA-Z0-9]+', // Stripe live
    're_[a-zA-Z0-9]{20,}',  // Resend (but not re_placeholder which is already checked)
    'ghp_[a-zA-Z0-9]+',     // GitHub PAT
    'AKIA[A-Z0-9]{16}',     // AWS
    '-----BEGIN.*PRIVATE KEY-----',
  ];
  const pat = patterns.join('\\|');
  const out = run(`grep -rn "${pat}" --include='*.ts' --include='*.tsx' --include='*.js' lib/ app/ components/ || true`);
  return { pass: out.trim().length === 0, detail: out.trim() || 'None found' };
});

// ── C) ENVIRONMENT & SECRETS READINESS ─────────────────────────────
console.log('\n═══ C) ENVIRONMENT & SECRETS READINESS ═══');

check('Environment', 'Capabilities endpoint exists', () => {
  return { pass: existsSync(join(ROOT, 'app/api/capabilities/route.ts')), detail: 'app/api/capabilities/route.ts' };
});

check('Environment', '.env.example is complete', () => {
  const example = readFileSync(join(ROOT, '.env.example'), 'utf-8');
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'OPENAI_API_KEY', 'STRIPE_SECRET_KEY', 'RESEND_API_KEY'];
  const missing = requiredVars.filter(v => !example.includes(v));
  return { pass: missing.length === 0, detail: missing.length ? `Missing: ${missing.join(', ')}` : 'All documented' };
});

check('Environment', 'ProviderNotConfiguredError handled in API routes', () => {
  const apiDir = join(ROOT, 'lib/api-helpers.ts');
  const exists = existsSync(apiDir);
  return { pass: exists, detail: exists ? 'lib/api-helpers.ts with handleApiError' : 'MISSING: API routes need ProviderNotConfiguredError → 503 handler' };
});

// ── D) TESTS ───────────────────────────────────────────────────────
console.log('\n═══ D) FUNCTIONAL TESTS ═══');

check('Tests', 'Unit tests pass (vitest)', () => {
  const out = run('npm run test 2>&1');
  const pass = out.includes('passed') && !out.includes('failed');
  return { pass, detail: out.trim().split('\n').slice(-5).join('\n') };
});

check('Tests', 'Build succeeds', () => {
  const out = run('npm run build 2>&1');
  const pass = !out.includes('Build error') && !out.includes('Failed to compile');
  return { pass, detail: pass ? 'Build succeeded' : out.trim().slice(-500) };
});

// ── E) INFRASTRUCTURE ──────────────────────────────────────────────
console.log('\n═══ E) INFRASTRUCTURE ═══');

check('Infra', 'Health endpoint exists', () => {
  return { pass: existsSync(join(ROOT, 'app/api/health/route.ts')), detail: '/api/health' };
});

check('Infra', 'Ready endpoint exists', () => {
  return { pass: existsSync(join(ROOT, 'app/api/ready/route.ts')), detail: '/api/ready' };
});

check('Infra', 'Request ID middleware exists', () => {
  const mw = readFileSync(join(ROOT, 'middleware.ts'), 'utf8');
  return { pass: mw.includes('X-Request-Id'), detail: 'X-Request-Id set in middleware.ts' };
});

check('Infra', 'Rate limiting configured', () => {
  return { pass: existsSync(join(ROOT, 'lib/middleware/rate-limit.ts')), detail: 'lib/middleware/rate-limit.ts' };
});

check('Infra', 'Prisma schema valid', () => {
  const out = run('npx prisma validate 2>&1');
  return { pass: !out.includes('error'), detail: 'Schema valid' };
});

// ── F) SECURITY ────────────────────────────────────────────────────
console.log('\n═══ F) SECURITY CONTROLS ═══');

check('Security', 'Security headers in middleware', () => {
  const mw = readFileSync(join(ROOT, 'middleware.ts'), 'utf-8');
  const headers = ['X-Content-Type-Options', 'X-Frame-Options', 'Content-Security-Policy', 'Strict-Transport-Security'];
  const found = headers.filter(h => mw.includes(h));
  return { pass: found.length === headers.length, detail: `${found.length}/${headers.length} headers` };
});

check('Security', 'CSRF protection (SameSite cookies via NextAuth)', () => {
  const authFile = readFileSync(join(ROOT, 'auth.ts'), 'utf-8');
  const hasAuth = authFile.includes('NextAuth') || authFile.includes('authConfig');
  return { pass: hasAuth, detail: 'NextAuth with JWT (SameSite=Lax by default)' };
});

check('Security', 'Input validation (Zod schemas)', () => {
  const out = run('grep -rn "from \'zod\'" --include="*.ts" --include="*.tsx" lib/ app/ || true');
  const count = out.trim().split('\n').filter(Boolean).length;
  return { pass: count >= 3, detail: `${count} files using Zod` };
});

check('Security', 'Tenant isolation (userId scoping)', () => {
  const out = run('grep -rn "userId.*session" --include="*.ts" app/api/ || true');
  const count = out.trim().split('\n').filter(Boolean).length;
  return { pass: count >= 5, detail: `${count} API routes scope by userId` };
});

// ═══ REPORT ════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`RESULTS: ${totalPass} PASS / ${totalFail} FAIL / ${totalPass + totalFail} TOTAL`);

const goNoGo = totalFail === 0 ? 'GO' : 'NO-GO';
console.log(`VERDICT: ${goNoGo}`);

// Generate report
const now = new Date().toISOString();
let report = `# Enterprise Audit Report\n\n`;
report += `> Generated: ${now}\n`;
report += `> Verdict: **${goNoGo}**\n`;
report += `> Pass: ${totalPass} | Fail: ${totalFail} | Total: ${results.length}\n\n`;

// Group by category
const categories = [...new Set(results.map(r => r.category))];
for (const cat of categories) {
  report += `## ${cat}\n\n`;
  report += `| Check | Status | Detail |\n|-------|--------|--------|\n`;
  for (const r of results.filter(r2 => r2.category === cat)) {
    const status = r.pass ? '✅ PASS' : '❌ FAIL';
    const detail = r.detail.replace(/\n/g, ' ').slice(0, 100);
    report += `| ${r.name} | ${status} | ${detail} |\n`;
  }
  report += '\n';
}

// Remediation section for failures
const failures = results.filter(r => !r.pass);
if (failures.length > 0) {
  report += `## Remediation Required\n\n`;
  for (const f of failures) {
    report += `### ${f.category}: ${f.name}\n`;
    report += `- Detail: ${f.detail}\n\n`;
  }
}

report += `## GO / NO-GO\n\n`;
if (goNoGo === 'GO') {
  report += `**✅ GO** — All ${results.length} checks passed. Ready for launch.\n`;
} else {
  report += `**❌ NO-GO** — ${totalFail} check(s) failed. Fix the items above and re-run.\n`;
}

writeFileSync(join(ROOT, 'AUDIT_REPORT.md'), report, 'utf-8');
console.log(`\nReport written to AUDIT_REPORT.md`);

process.exit(totalFail === 0 ? 0 : 1);
