-- Enable unaccent extension for better slug generation
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Add slug column
ALTER TABLE pets ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create function to generate slugs
CREATE OR REPLACE FUNCTION generate_pet_slug(name text, id uuid) RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
BEGIN
  -- Lowercase, unaccent, remove non-alphanumeric (except dashes), trim dashes
  base_slug := lower(unaccent(name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Append short ID for uniqueness
  new_slug := base_slug || '-' || substring(id::text from 1 for 5);
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing pets
UPDATE pets SET slug = generate_pet_slug(name, id) WHERE slug IS NULL;

-- Trigger to automatically generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION set_pet_slug() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_pet_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_pet_slug ON pets;
CREATE TRIGGER ensure_pet_slug
BEFORE INSERT OR UPDATE ON pets
FOR EACH ROW
EXECUTE FUNCTION set_pet_slug();
