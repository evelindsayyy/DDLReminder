// Tag normalization for assignments.
//
// QuickAdd's parser lowercases `#tags`, but the create route also accepts tags
// from any client (and, later, a structured form), so we re-normalize at the
// API boundary: trim, lowercase, drop empties, dedupe, and cap count/length to
// match the zod schema (≤10 tags, ≤32 chars each). Pure + unit-tested.

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 32;

export function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const tag = raw.trim().toLowerCase();
    if (!tag) continue;
    // Drop (rather than truncate) overlong tags — truncation can produce a
    // surprising tag the user never typed.
    if (tag.length > MAX_TAG_LENGTH) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }

  return out;
}
