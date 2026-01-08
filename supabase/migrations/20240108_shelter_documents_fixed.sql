-- 1. Create the storage bucket for shelter documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('shelter-documents', 'shelter-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set RLS policies for the storage bucket

-- Allow public read access to all files in the bucket
CREATE POLICY "Public Access Shelter Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'shelter-documents' );

-- Allow shelters to upload files to their own folder (folder name matches their profile ID)
CREATE POLICY "Shelters Upload Own Docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow shelters to update their own files
CREATE POLICY "Shelters Update Own Docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow shelters to delete their own documents
CREATE POLICY "Shelters Delete Own Docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shelter-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
