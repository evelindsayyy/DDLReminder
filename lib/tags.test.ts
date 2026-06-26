// Assertion-based unit tests for normalizeTags in lib/tags.ts.
// Run: npx tsx lib/tags.test.ts   (exits non-zero on any failure)
//
// normalizeTags guards the assignment-create boundary: tags arrive from the NL
// parser and (later) a structured form, so trimming / lowercasing / deduping /
// capping must be deterministic. A regression here would persist junk tags or
// blow past the column's expected shape.

import { normalizeTags, MAX_TAGS, MAX_TAG_LENGTH } from './tags';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}
const eq = (a: string[], b: string[]) => JSON.stringify(a) === JSON.stringify(b);

// non-array / nullish input → empty array (never throws)
check('null → []', eq(normalizeTags(null), []));
check('undefined → []', eq(normalizeTags(undefined), []));
check('string → []', eq(normalizeTags('hard'), []));
check('empty array → []', eq(normalizeTags([]), []));

// trim + lowercase
check('trims and lowercases', eq(normalizeTags(['  Hard ', 'GROUP']), ['hard', 'group']),
  `got ${JSON.stringify(normalizeTags(['  Hard ', 'GROUP']))}`);

// drop empties and whitespace-only
check('drops empty/whitespace entries', eq(normalizeTags(['', '   ', 'ok']), ['ok']),
  `got ${JSON.stringify(normalizeTags(['', '   ', 'ok']))}`);

// dedupe, preserving first-seen order (case-insensitively)
check('dedupes case-insensitively, keeps order',
  eq(normalizeTags(['group', 'hard', 'Group', 'HARD']), ['group', 'hard']),
  `got ${JSON.stringify(normalizeTags(['group', 'hard', 'Group', 'HARD']))}`);

// skip non-string members
check('skips non-string members',
  eq(normalizeTags(['a', 5, null, { x: 1 }, 'b'] as unknown[]), ['a', 'b']),
  `got ${JSON.stringify(normalizeTags(['a', 5, null, { x: 1 }, 'b'] as unknown[]))}`);

// drop overlong tags rather than truncate
const longTag = 'x'.repeat(MAX_TAG_LENGTH + 1);
check('drops overlong tag', eq(normalizeTags([longTag, 'keep']), ['keep']),
  `got ${JSON.stringify(normalizeTags([longTag, 'keep']))}`);
const exactTag = 'y'.repeat(MAX_TAG_LENGTH);
check('keeps exactly-max-length tag', eq(normalizeTags([exactTag]), [exactTag]));

// cap the count at MAX_TAGS
const many = Array.from({ length: MAX_TAGS + 5 }, (_, i) => `t${i}`);
const capped = normalizeTags(many);
check('caps count at MAX_TAGS', capped.length === MAX_TAGS, `got ${capped.length}`);
check('cap keeps the first MAX_TAGS', eq(capped, many.slice(0, MAX_TAGS)),
  `got ${JSON.stringify(capped)}`);

// realistic parser output passes through unchanged
check('clean parser tags pass through', eq(normalizeTags(['group']), ['group']));

console.log(`\ntags.test.ts — ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
