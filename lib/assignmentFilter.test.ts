// Assertion-based unit tests for the assignments list filters in
// lib/assignmentFilter.ts.
// Run: npx tsx lib/assignmentFilter.test.ts   (exits non-zero on any failure)
//
// These back the list view's open/done toggle plus the tag chooser. A
// regression here silently shows the wrong rows (e.g. a "done" item under
// "open", or a tag filter that swallows everything), so the status/tag/empty
// edge cases are worth pinning.

import {
  filterByStatus,
  collectTags,
  filterByTag,
  type FilterableAssignment,
} from './assignmentFilter';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const a = (id: string, completed: boolean, tags: string[] | null): FilterableAssignment & { id: string } => ({
  id,
  completed_at: completed ? '2026-06-01T00:00:00Z' : null,
  tags,
});

const rows = [
  a('1', false, ['hard', 'group']),
  a('2', true, ['group']),
  a('3', false, null),
  a('4', false, []),
  a('5', true, ['HARD']),
];

// --- filterByStatus ---
check('open → only incomplete rows',
  filterByStatus(rows, 'open').map((r) => r.id).join(',') === '1,3,4',
  filterByStatus(rows, 'open').map((r) => r.id).join(','));
check('done → only completed rows',
  filterByStatus(rows, 'done').map((r) => r.id).join(',') === '2,5',
  filterByStatus(rows, 'done').map((r) => r.id).join(','));
check('all → every row, in order',
  filterByStatus(rows, 'all').map((r) => r.id).join(',') === '1,2,3,4,5',
  filterByStatus(rows, 'all').map((r) => r.id).join(','));
check('all returns a fresh array (no mutation of input)',
  filterByStatus(rows, 'all') !== (rows as unknown));
check('empty input → empty result', filterByStatus([], 'open').length === 0);

// --- collectTags ---
check('collects distinct trimmed tags, case-sensitively distinct, locale-sorted',
  collectTags(rows).join(',') === 'group,hard,HARD',
  collectTags(rows).join(','));
check('null/empty tag arrays contribute nothing',
  collectTags([a('x', false, null), a('y', false, [])]).length === 0);
check('whitespace-only tags are dropped, surrounding space trimmed',
  collectTags([a('z', false, ['  spaced  ', '   ', ''])]).join(',') === 'spaced',
  collectTags([a('z', false, ['  spaced  ', '   ', ''])]).join(','));
check('duplicate tags collapse to one',
  collectTags([a('p', false, ['group']), a('q', false, ['group'])]).join(',') === 'group');

// --- filterByTag ---
check('null tag → everything (no filter)',
  filterByTag(rows, null).map((r) => r.id).join(',') === '1,2,3,4,5');
check('empty-string tag → everything (no filter)',
  filterByTag(rows, '').map((r) => r.id).join(',') === '1,2,3,4,5');
check('tag "group" → only rows carrying it',
  filterByTag(rows, 'group').map((r) => r.id).join(',') === '1,2',
  filterByTag(rows, 'group').map((r) => r.id).join(','));
check('tag matching is exact/case-sensitive',
  filterByTag(rows, 'hard').map((r) => r.id).join(',') === '1',
  filterByTag(rows, 'hard').map((r) => r.id).join(','));
check('unknown tag → empty result',
  filterByTag(rows, 'nope').length === 0);
check('null/empty tag arrays never match a tag',
  filterByTag([a('x', false, null), a('y', false, [])], 'group').length === 0);

// --- composition (status then tag, as the view applies them) ---
check('open + tag "group" composes correctly',
  filterByTag(filterByStatus(rows, 'open'), 'group').map((r) => r.id).join(',') === '1',
  filterByTag(filterByStatus(rows, 'open'), 'group').map((r) => r.id).join(','));

console.log(`\nassignmentFilter.test.ts — ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
