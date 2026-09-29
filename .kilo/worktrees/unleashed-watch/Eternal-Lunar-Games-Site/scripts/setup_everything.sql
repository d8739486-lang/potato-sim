-- ==========================================
-- 1. CREATE PROJECTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  type TEXT DEFAULT 'game', -- 'game' or 'mod'
  cover_url TEXT,
  link TEXT,
  mc_version TEXT,
  modloader TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Enable read access for all users on projects"
ON projects FOR SELECT USING (true);

-- Allow insert/update/delete access to everyone
CREATE POLICY "Enable write access for all users on projects"
ON projects FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users on projects"
ON projects FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users on projects"
ON projects FOR DELETE USING (true);

-- ==========================================
-- 2. INSERT DEFAULT GAMES (Only if they don't exist)
-- ==========================================
INSERT INTO projects (title, description, type, cover_url, link, status)
SELECT 'Pc Master', 'Борьба с вирусами, взлом систем и расследование тайных схем корпорации Digital Dreams.

3 главы доступно', 'game', '/pc_master_cover.jpg', '/games/pc-master', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Pc Master');

INSERT INTO projects (title, description, type, cover_url, link, status)
SELECT 'Симулятор Картошки', 'Выращивай картофель, расширяй грядки и создавай невероятную фермерскую империю.', 'game', '/potato_sim_cover.jpg', 'https://potato-sim.vercel.app', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Симулятор Картошки');

INSERT INTO projects (title, description, type, cover_url, link, status)
SELECT 'Неоновая Змейка', 'Классическая змейка в совершенно новом неоновом киберпанк стиле с потрясающими эффектами.', 'game', '/snake_cover.png', 'https://neon-snake-six-cyan.vercel.app', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Неоновая Змейка');


-- ==========================================
-- 3. CREATE STORAGE BUCKET FOR FILES
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project_files' );

-- Allow public insert access to the bucket
CREATE POLICY "Public Insert Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'project_files' );

-- Allow public update access to the bucket
CREATE POLICY "Public Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'project_files' );

-- Allow public delete access to the bucket
CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'project_files' );
