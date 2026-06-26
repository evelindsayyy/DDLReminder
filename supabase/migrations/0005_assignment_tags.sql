-- ============================================================
-- Deadline Tracker: persist assignment tags
-- QuickAdd already parses, displays, and sends `#tags`, but there was
-- nowhere to store them. This adds the column so tags survive a save and
-- can be surfaced on cards (and filtered on later).
-- NOT NULL with a '{}' default — safe to apply on existing data, and inserts
-- that omit tags keep working.
-- ============================================================

alter table public.assignments
  add column tags text[] not null default '{}';
