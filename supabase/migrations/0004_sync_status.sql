-- ============================================================
-- Deadline Tracker: integration sync status
-- Records the outcome of the last Canvas sync so the UI can show
-- "last synced …" and surface failures instead of failing silently.
-- Both columns are NULLable — safe to apply on existing data.
-- ============================================================

alter table public.user_prefs
  add column canvas_last_sync_at timestamptz,
  add column canvas_last_sync_error text;
