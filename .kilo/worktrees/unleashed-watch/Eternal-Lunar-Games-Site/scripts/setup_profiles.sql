-- ==========================================
-- CREATE PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Enable read access for all users on profiles"
ON profiles FOR SELECT USING (true);

-- Allow insert/update access to everyone (so users can register)
CREATE POLICY "Enable write access for all users on profiles"
ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users on profiles"
ON profiles FOR UPDATE USING (true);
