-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ALLOW SELECT for everyone (Authenticated and Anon if needed, usually just Authenticated is enough but Public is safer for shared profiles)
-- We'll allow public read so that shelters can see applicant profiles and vice versa without complex logic.
DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
CREATE POLICY "Public profiles are visible" 
ON public.profiles FOR SELECT 
USING (true);

-- ALLOW UPDATE for owners
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- ALLOW INSERT?
-- Insert is usually handled by the Trigger (SECURITY DEFINER).
-- But if we ever allow client-side profile creation (unlikely), we'd need this. 
-- For now, relying on Trigger is best practice.

-- Verify/Update the Trigger Function to be robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Užívateľ'),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    now()
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotency
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth user creation if acceptable, 
    -- OR raise exception to rollback everything.
    -- Better to rollback so we don't end up with inconsistent state.
    RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
