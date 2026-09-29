-- ============================================================
-- STEP 1: Ensure projects table has all needed columns
-- ============================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_type TEXT DEFAULT 'simple';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS chapters    TEXT DEFAULT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link        TEXT DEFAULT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_url   TEXT DEFAULT NULL;

-- Add UNIQUE constraint to title for the ON CONFLICT upserts to work
ALTER TABLE projects ADD CONSTRAINT projects_title_key UNIQUE (title);

-- ============================================================
-- STEP 2: Insert / upsert the 3 hardcoded games into projects
-- (uses ON CONFLICT to avoid duplicates on re-run)
-- ============================================================

-- PC Master
INSERT INTO projects (title, description, type, cover_url, link, status, display_type, chapters)
VALUES (
  'Pc Master',
  'Борьба с вирусами, взлом систем и расследование тайных схем корпорации Digital Dreams.',
  'game',
  '/pc_master_cover.jpg',
  '/games/pc-master',
  'Active',
  'chapters',
  '[{"title":"Глава 1","subtitle":"Начало пути","description":"Игрок успешно справился с вирусом и устроился работать, но что-то пошло не так...","link":"https://pc-master-chapter1.vercel.app","available":true},{"title":"Глава 2","subtitle":"Digital Dreams","description":"Компания Digital Dreams захватила компьютер главного героя, но ему помог его друг... но это не конец.","link":"https://pc-master-chapter2.vercel.app","available":true},{"title":"Глава 3","subtitle":"Сомнения","description":"Подозрение, что друг с этим как-то замешан...","link":"","available":false}]'
)
ON CONFLICT (title) DO UPDATE SET
  description  = EXCLUDED.description,
  cover_url    = EXCLUDED.cover_url,
  link         = EXCLUDED.link,
  display_type = EXCLUDED.display_type,
  chapters     = EXCLUDED.chapters;

-- Potato Simulator
INSERT INTO projects (title, description, type, cover_url, link, status, display_type)
VALUES (
  'Симулятор Картошки',
  'Выращивай картофель, расширяй грядки и создавай невероятную фермерскую империю.',
  'game',
  '/potato_sim_cover.jpg',
  'https://potato-sim.vercel.app',
  'Active',
  'simple'
)
ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  cover_url   = EXCLUDED.cover_url,
  link        = EXCLUDED.link;

-- Neon Snake
INSERT INTO projects (title, description, type, cover_url, link, status, display_type)
VALUES (
  'Неоновая Змейка',
  'Классическая змейка в совершенно новом неоновом киберпанк стиле с потрясающими эффектами.',
  'game',
  '/snake_cover.png',
  'https://neon-snake-six-cyan.vercel.app',
  'Active',
  'simple'
)
ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  cover_url   = EXCLUDED.cover_url,
  link        = EXCLUDED.link;

-- ============================================================
-- STEP 3: Create mods system tables (Drop old/malformed first)
-- ============================================================

DROP TABLE IF EXISTS mod_gallery CASCADE;
DROP TABLE IF EXISTS mod_versions CASCADE;
DROP TABLE IF EXISTS mods CASCADE;

CREATE TABLE mods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  short_description TEXT DEFAULT '',
  long_description  TEXT DEFAULT '',
  icon_url         TEXT DEFAULT NULL,
  banner_url       TEXT DEFAULT NULL,
  mc_versions      TEXT DEFAULT '[]',      -- JSON array e.g. ["1.20.1","1.21.1"]
  platforms        TEXT DEFAULT '[]',      -- JSON array e.g. ["Fabric","Forge"]
  tags             TEXT DEFAULT '[]',      -- JSON array e.g. ["Adventure","QoL"]
  links            TEXT DEFAULT '{}',      -- JSON object {source_url, issues_url, discord_url, wiki_url}
  changelog        TEXT DEFAULT '',
  downloads        INTEGER DEFAULT 0,
  followers        INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'Active',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mod_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id           UUID REFERENCES mods(id) ON DELETE CASCADE,
  version_number   TEXT NOT NULL,          -- e.g. "1.0.2"
  mc_version       TEXT NOT NULL,          -- e.g. "1.21.1"
  platform         TEXT NOT NULL,          -- e.g. "Fabric"
  download_url     TEXT DEFAULT '',
  file_size        TEXT DEFAULT '',        -- e.g. "2.4 MB"
  release_type     TEXT DEFAULT 'Release', -- Release | Beta | Alpha
  release_date     TEXT DEFAULT '',
  changelog        TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mod_gallery (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id     UUID REFERENCES mods(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security (public read)
ALTER TABLE mods        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mod_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mod_gallery  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read mods"         ON mods;
DROP POLICY IF EXISTS "Public read mod_versions" ON mod_versions;
DROP POLICY IF EXISTS "Public read mod_gallery"  ON mod_gallery;

CREATE POLICY "Public read mods"         ON mods         FOR SELECT USING (true);
CREATE POLICY "Public read mod_versions" ON mod_versions FOR SELECT USING (true);
CREATE POLICY "Public read mod_gallery"  ON mod_gallery  FOR SELECT USING (true);

-- ============================================================
-- STEP 4: Seed example mod (replace with your real data)
-- ============================================================
INSERT INTO mods (slug, title, short_description, long_description, mc_versions, platforms, tags, links, downloads, followers, status)
VALUES (
  'example-mod',
  'Example Mod',
  'Пример мода — замени на реальный мод.',
  '## О моде\n\nЭто пример описания мода. Замени его на настоящий контент.\n\n## Особенности\n- Особенность 1\n- Особенность 2',
  '["1.20.1","1.21.1"]',
  '["Fabric","Forge"]',
  '["Adventure","QoL"]',
  '{"source_url":"","issues_url":"","discord_url":"","wiki_url":""}',
  0,
  0,
  'Active'
)
ON CONFLICT (slug) DO NOTHING;
