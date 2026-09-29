-- ==========================================
-- ADD display_type AND chapters COLUMNS
-- Run this in Supabase SQL Editor
-- ==========================================

-- Add display_type column (simple | chapters)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS display_type TEXT DEFAULT 'simple';

-- Add chapters column (JSON array stored as TEXT)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS chapters TEXT DEFAULT NULL;

-- Update existing Pc Master record to chapters mode
UPDATE projects
SET
  display_type = 'chapters',
  chapters = '[{"title":"Глава 1","subtitle":"Начало пути","description":"Игрок успешно справился с вирусом и устроился работать, но что-то пошло не так...","link":"https://pc-master-chapter1.vercel.app","available":true},{"title":"Глава 2","subtitle":"Digital Dreams","description":"Компания Digital Dreams захватила компьютер главного героя, но ему помог его друг... но это не конец.","link":"https://pc-master-chapter2.vercel.app","available":true},{"title":"Глава 3","subtitle":"Сомнения","description":"Подозрение, что друг с этим как-то замешан...","link":"","available":false}]'
WHERE title = 'Pc Master';
