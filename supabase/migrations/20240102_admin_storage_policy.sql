-- Allow Admins (Super Admins) to upload to 'images' bucket
-- This is necessary because default policies might only allow users to upload to their own folders or specific paths.

-- 1. Policy for INSERT (Upload)
CREATE POLICY "Admins can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 2. Policy for UPDATE (Overwrite)
CREATE POLICY "Admins can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  bucket_id = 'images' AND
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 3. Policy for DELETE (Remove old logos if needed)
CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
);
