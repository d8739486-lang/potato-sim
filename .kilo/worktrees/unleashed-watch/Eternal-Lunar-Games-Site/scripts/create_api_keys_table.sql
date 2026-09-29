-- Run this SQL in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS admin_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  ip_address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (optional but recommended)
ALTER TABLE admin_api_keys ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to everyone (since you are using anon key on the frontend without logged-in auth user)
-- Note: You might want to restrict this further, but for this implementation we need it accessible.
CREATE POLICY "Enable all access for all users"
ON admin_api_keys
FOR ALL
USING (true)
WITH CHECK (true);
