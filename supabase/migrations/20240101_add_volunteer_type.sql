-- Migration to support 'volunteer' organization type
-- Run this in your Supabase SQL Editor

-- 1. Remove old constraint if it exists (assuming it was named shelter_data_type_check or similar)
-- We use a broad DROP to be safe, as we want to allow the new value.
-- Note: Replace 'profiles_shelter_data_check' with the actual name of your constraint if you know it.
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_shelter_data_check') THEN 
        ALTER TABLE profiles DROP CONSTRAINT profiles_shelter_data_check; 
    END IF; 
END $$;

-- 2. (Optional) If you want to enforce the types strictly, run this:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_shelter_data_check 
-- CHECK (
--   shelter_data->>'organizationType' IS NULL OR 
--   shelter_data->>'organizationType' IN ('shelter', 'civic_association', 'quarantine_station', 'volunteer')
-- );

-- 3. Ensure Super Admins can update profiles (if RLS was preventing it)
-- Note: You might already have a policy for this.
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
);
