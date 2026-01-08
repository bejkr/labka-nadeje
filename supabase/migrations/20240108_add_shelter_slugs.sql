-- Enable unaccent extension for better slug generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Add slug column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create function to generate profile slugs
CREATE OR REPLACE FUNCTION generate_profile_slug(name text, id uuid) RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
BEGIN
  -- Lowercase, unaccent, remove non-alphanumeric (except dashes), trim dashes
  -- Handle null name by using 'profile'
  base_slug := lower(unaccent(COALESCE(name, 'profile')));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- If slug is empty after processing (e.g. name was "???"), use 'profile'
  IF base_slug = '' THEN
    base_slug := 'profile';
  END IF;

  -- Append short ID for uniqueness to ensure no collisions
  new_slug := base_slug || '-' || substring(id::text from 1 for 5);
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles that are shelters (or all profiles if we want slugs for users too, let's do all for consistency but prioritize shelters in usage)
UPDATE profiles SET slug = generate_profile_slug(name, id) WHERE slug IS NULL;

-- Trigger to automatically generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION set_profile_slug() RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is missing
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_profile_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_profile_slug ON profiles;
CREATE TRIGGER ensure_profile_slug
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_profile_slug();
