-- 1. Add new columns to the 'projects' table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS mc_version TEXT,
ADD COLUMN IF NOT EXISTS modloader TEXT;

-- 2. Create the 'project_files' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies to allow anyone to read and upload files 
-- (Since the CMS is protected by the frontend logic/anon key, we'll allow anon uploads for simplicity in this prototype)

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
