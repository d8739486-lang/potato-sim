-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  type TEXT DEFAULT 'game', -- 'game' or 'mod'
  cover_url TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (so games show up on the public site)
CREATE POLICY "Enable read access for all users"
ON projects FOR SELECT USING (true);

-- Allow insert/update/delete access to everyone (secured by our app UI via anon key)
CREATE POLICY "Enable write access for all users"
ON projects FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON projects FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users"
ON projects FOR DELETE USING (true);

-- ==========================================
-- INSERT DEFAULT GAMES
-- ==========================================
INSERT INTO projects (title, description, type, cover_url, link, status)
VALUES 
(
  'Pc Master',
  'Борьба с вирусами, взлом систем и расследование тайных схем корпорации Digital Dreams.

3 главы доступно',
  'game',
  '/pc_master_cover.jpg',
  '/games/pc-master',
  'Active'
),
(
  'Симулятор Картошки',
  'Выращивай картофель, расширяй грядки и создавай невероятную фермерскую империю.',
  'game',
  '/potato_sim_cover.jpg',
  'https://potato-sim.vercel.app',
  'Active'
),
(
  'Неоновая Змейка',
  'Классическая змейка в совершенно новом неоновом киберпанк стиле с потрясающими эффектами.',
  'game',
  '/snake_cover.png',
  'https://neon-snake-six-cyan.vercel.app',
  'Active'
);
