// Assertion-based unit tests for the token generator in lib/prefs.ts.
// Run: npx tsx lib/prefs.test.ts   (exits non-zero on any failure)
//
// generateToken is the auth for the public .ics feed and the Gradescope sync
// endpoint (the token IS the credential), so its format and unguessability are
// worth pinning: 64 lowercase hex chars (~256 bits) and collision-free in bulk.

import { generateToken } from './prefs';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const HEX64 = /^[0-9a-f]{64}$/;

// shape
const t = generateToken();
check('length is 64', t.length === 64, `got ${t.length}`);
check('lowercase hex only', HEX64.test(t), `got "${t}"`);

// every token in a batch is well-formed
const batch = Array.from({ length: 1000 }, () => generateToken());
check('all 1000 match /^[0-9a-f]{64}$/', batch.every((x) => HEX64.test(x)));

// uniqueness — collisions at 256 bits are astronomically unlikely; any dup is a bug
check('no collisions across 1000 tokens', new Set(batch).size === 1000,
  `unique ${new Set(batch).size}/1000`);

// not constant between calls
check('two successive tokens differ', generateToken() !== generateToken());

console.log(`\nprefs.test.ts — ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
