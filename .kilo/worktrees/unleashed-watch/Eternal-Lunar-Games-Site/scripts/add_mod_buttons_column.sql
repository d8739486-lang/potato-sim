-- ==========================================
-- ADD buttons COLUMN TO mods
-- ==========================================

ALTER TABLE mods
  ADD COLUMN IF NOT EXISTS buttons TEXT DEFAULT NULL;

-- buttons format (JSON stored as TEXT):
-- [
--   { "label": "Скачать мод", "url": "", "enabled": true, "style": "primary" },
--   { "label": "Смотреть на GitHub", "url": "", "enabled": false, "style": "secondary" },
--   { "label": "Поддержать автора", "url": "", "enabled": false, "style": "secondary" }
-- ]
