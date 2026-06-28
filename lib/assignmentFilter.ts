// Pure helpers for filtering the assignments list view.
//
// Extracted from `components/assignments/AssignmentsView.tsx` so the status
// filter and the new tag filter are unit-testable without a React render.
// Every function returns a fresh array — callers never mutate the input.

export type StatusFilter = 'all' | 'open' | 'done';

/** The minimal shape these filters read. `AssignmentCardData` is assignable. */
export interface FilterableAssignment {
  completed_at: string | null;
  tags: string[] | null;
}

/** Open = not completed, done = completed, all = everything. */
export function filterByStatus<T extends FilterableAssignment>(
  assignments: readonly T[],
  status: StatusFilter
): T[] {
  if (status === 'open') return assignments.filter((a) => !a.completed_at);
  if (status === 'done') return assignments.filter((a) => a.completed_at !== null);
  return [...assignments];
}

/**
 * Distinct, trimmed tags across the given assignments, sorted
 * case-insensitively. Empty/whitespace tags are dropped. Used to build the
 * tag-filter chooser.
 */
export function collectTags(assignments: readonly FilterableAssignment[]): string[] {
  const seen = new Set<string>();
  for (const a of assignments) {
    for (const raw of a.tags ?? []) {
      const tag = raw.trim();
      if (tag) seen.add(tag);
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

/**
 * Keep only assignments carrying `tag`. A null/empty `tag` is the "no tag
 * filter" case and returns everything. Matching is exact (tags are already
 * normalized at the API boundary via `lib/tags.ts`).
 */
export function filterByTag<T extends FilterableAssignment>(
  assignments: readonly T[],
  tag: string | null
): T[] {
  if (!tag) return [...assignments];
  return assignments.filter((a) => (a.tags ?? []).includes(tag));
}
