-- Add full public access policies to mods tables so Admin Panel can save them

-- MODS
DROP POLICY IF EXISTS "Public read mods" ON mods;
DROP POLICY IF EXISTS "Public insert mods" ON mods;
DROP POLICY IF EXISTS "Public update mods" ON mods;
DROP POLICY IF EXISTS "Public delete mods" ON mods;

CREATE POLICY "Public read mods" ON mods FOR SELECT USING (true);
CREATE POLICY "Public insert mods" ON mods FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update mods" ON mods FOR UPDATE USING (true);
CREATE POLICY "Public delete mods" ON mods FOR DELETE USING (true);

-- MOD VERSIONS
DROP POLICY IF EXISTS "Public read mod_versions" ON mod_versions;
DROP POLICY IF EXISTS "Public insert mod_versions" ON mod_versions;
DROP POLICY IF EXISTS "Public update mod_versions" ON mod_versions;
DROP POLICY IF EXISTS "Public delete mod_versions" ON mod_versions;

CREATE POLICY "Public read mod_versions" ON mod_versions FOR SELECT USING (true);
CREATE POLICY "Public insert mod_versions" ON mod_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update mod_versions" ON mod_versions FOR UPDATE USING (true);
CREATE POLICY "Public delete mod_versions" ON mod_versions FOR DELETE USING (true);

-- MOD GALLERY
DROP POLICY IF EXISTS "Public read mod_gallery" ON mod_gallery;
DROP POLICY IF EXISTS "Public insert mod_gallery" ON mod_gallery;
DROP POLICY IF EXISTS "Public update mod_gallery" ON mod_gallery;
DROP POLICY IF EXISTS "Public delete mod_gallery" ON mod_gallery;

CREATE POLICY "Public read mod_gallery" ON mod_gallery FOR SELECT USING (true);
CREATE POLICY "Public insert mod_gallery" ON mod_gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update mod_gallery" ON mod_gallery FOR UPDATE USING (true);
CREATE POLICY "Public delete mod_gallery" ON mod_gallery FOR DELETE USING (true);

-- Ensure projects have full access too
DROP POLICY IF EXISTS "Public Read Access" ON projects;
DROP POLICY IF EXISTS "Public Insert Access" ON projects;
DROP POLICY IF EXISTS "Public Update Access" ON projects;
DROP POLICY IF EXISTS "Public Delete Access" ON projects;

CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON projects FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON projects FOR DELETE USING (true);
