-- Allow Super Admins to INSERT into pets table
CREATE POLICY "Super Admins can insert pets" ON pets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
);

-- Allow Super Admins to UPDATE any pet
CREATE POLICY "Super Admins can update pets" ON pets
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
);

-- Allow Super Admins to DELETE any pet
CREATE POLICY "Super Admins can delete pets" ON pets
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
);
