#!/usr/bin/env node
/**
 * verify-launch.mjs — Pre-launch verification script.
 *
 * Runs a series of checks to ensure the project is launch-ready.
 * Exit code 0 = all clear, 1 = blocking issues found.
 *
 * Usage: node scripts/verify-launch.mjs
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
let failures = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.log(`  ❌ ${name}`);
      failures++;
    } else {
      console.log(`  ✅ ${name}`);
    }
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failures++;
  }
}

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf-8' });
}

// ─── Checks ────────────────────────────────────────────────────────
console.log('\n🚀 Launch Verification\n');

console.log('── Source Quality ──');

check('No placeholder credentials', () => {
  const out = run('grep -rn "sk-placeholder\\|re_placeholder\\|sk_test_placeholder" --include="*.ts" --include="*.tsx" . || true');
  return out.trim().length === 0;
});

check('No TODO/FIXME in production code', () => {
  const out = run('grep -rn "// TODO\\|// FIXME\\|// HACK\\|// XXX" --include="*.ts" --include="*.tsx" lib/ app/ components/ || true');
  if (out.trim().length > 0) {
    console.log(`    Found:\n${out.trim().split('\n').slice(0, 5).map(l => `      ${l}`).join('\n')}`);
    return false;
  }
  return true;
});

check('No test routes in app/', () => {
  const testDirs = ['app/test-grapes', 'app/test-mapbox', 'app/dashboard/ui-test'];
  return testDirs.every(d => !existsSync(join(ROOT, d)));
});

check('No debug files at root', () => {
  const debugFiles = ['debug-canvas.html', 'database-setup.sql', 'AUDIT_SUMMARY.txt'];
  return debugFiles.every(f => !existsSync(join(ROOT, f)));
});

console.log('\n── Config ──');

check('.env.example exists', () => {
  return existsSync(join(ROOT, '.env.example'));
});

check('Prisma schema valid', () => {
  run('npx prisma validate');
  return true;
});

console.log('\n── Infrastructure ──');

check('Health endpoint exists', () => {
  return existsSync(join(ROOT, 'app/api/health/route.ts'));
});

check('Ready endpoint exists', () => {
  return existsSync(join(ROOT, 'app/api/ready/route.ts'));
});

check('Capabilities endpoint exists', () => {
  return existsSync(join(ROOT, 'app/api/capabilities/route.ts'));
});

check('Env validation module exists', () => {
  return existsSync(join(ROOT, 'lib/env.server.ts')) && existsSync(join(ROOT, 'lib/env.client.ts'));
});

console.log('\n── Build ──');

check('TypeScript compiles', () => {
  run('npx tsc --noEmit');
  return true;
});

// ─── Summary ───────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
if (failures === 0) {
  console.log('✅ All checks passed — ready to launch!\n');
  process.exit(0);
} else {
  console.log(`❌ ${failures} check(s) failed — fix before launch.\n`);
  process.exit(1);
}
