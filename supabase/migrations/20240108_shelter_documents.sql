-- 1. Add 'documents' column to 'shelters' table
ALTER TABLE shelters
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- 2. Create the storage bucket for shelter documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('shelter-documents', 'shelter-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set RLS policies for the storage bucket

-- Allow public read access to all files in the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'shelter-documents' );

-- Allow shelters to upload files to their own folder (folder name = shelter_id)
-- Note: We assume the file path pattern will be `{shelter_id}/{filename}`
CREATE POLICY "Shelters can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM shelters WHERE owner_id = auth.uid()
  )
);

-- Allow shelters to update/delete their own files
CREATE POLICY "Shelters can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM shelters WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM shelters WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Shelters can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM shelters WHERE owner_id = auth.uid()
  )
);
