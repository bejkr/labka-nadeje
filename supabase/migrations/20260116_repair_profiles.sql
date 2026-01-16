-- REPAIR AND ROBUSTNESS SCRIPT
-- 1. Backfill missing profiles for existing Auth Users
-- This fixes the state for users who "registered" but have no profile
INSERT INTO public.profiles (id, email, name, role, slug, created_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', 'Užívateľ'), 
  COALESCE(raw_user_meta_data->>'role', 'user'),
  'user-' || substring(id::text from 1 for 12),
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Client-Side Profile Creation (Fallback)
-- If the Trigger fails, the App can try to insert the profile manually.
-- We need an RLS policy for this.
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Ensure Update Policy is correct (re-apply from V2 just in case)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Ensure Public Read (re-apply)
DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
CREATE POLICY "Public profiles are visible" 
ON public.profiles FOR SELECT 
USING (true);
