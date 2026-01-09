-- Fix for registration trigger errors
-- 1. Ensure unaccent extension is installed
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;

-- 2. Make generate_profile_slug robust against nulls (idempotent update)
CREATE OR REPLACE FUNCTION generate_profile_slug(name text, id uuid) RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
BEGIN
  -- Fallback if unaccent is missing (though we tried to create it) or name is weird
  BEGIN
    base_slug := lower(unaccent(COALESCE(name, 'profile')));
  EXCEPTION WHEN OTHERS THEN
    base_slug := lower(COALESCE(name, 'profile'));
  END;

  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  IF base_slug = '' THEN base_slug := 'profile'; END IF;

  new_slug := base_slug || '-' || substring(id::text from 1 for 5);
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- 3. Redefine handle_new_user to be safe and report actual errors
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
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Reveal the actual database error
    RAISE EXCEPTION 'System Error during profile creation: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
