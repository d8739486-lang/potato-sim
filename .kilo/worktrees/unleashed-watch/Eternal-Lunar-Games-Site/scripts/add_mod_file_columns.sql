-- ==========================================
-- ADD file_url AND file_size COLUMNS TO mods
-- ==========================================

ALTER TABLE mods
  ADD COLUMN IF NOT EXISTS file_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS file_size TEXT DEFAULT NULL;
