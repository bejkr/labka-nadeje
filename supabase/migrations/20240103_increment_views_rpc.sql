-- Drop previous versions to ensure clean slate and signature update
DROP FUNCTION IF EXISTS increment_pet_views(uuid);
DROP FUNCTION IF EXISTS increment_shelter_views(uuid);

-- 1. Increment Pet Views - RETURNS NEW COUNT
CREATE OR REPLACE FUNCTION increment_pet_views(p_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count int;
BEGIN
  UPDATE pets
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_id
  RETURNING views INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Ensure "postgres" (superuser) owns the function to fully bypass RLS
ALTER FUNCTION increment_pet_views(uuid) OWNER TO postgres;

-- 2. Increment Shelter Views - RETURNS NEW COUNT
CREATE OR REPLACE FUNCTION increment_shelter_views(s_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stats jsonb;
  new_views int;
BEGIN
  -- Get current stats
  SELECT shelter_data->'stats' INTO current_stats
  FROM profiles
  WHERE id = s_id;

  -- Calculate new views
  new_views := COALESCE((current_stats->>'views')::int, 0) + 1;

  -- Update with new stats, preserving other fields
  UPDATE profiles
  SET shelter_data = jsonb_set(
    COALESCE(shelter_data, '{}'::jsonb),
    '{stats, views}',
    to_jsonb(new_views)
  )
  WHERE id = s_id;

  RETURN new_views;
END;
$$;

-- Ensure "postgres" (superuser) owns the function
ALTER FUNCTION increment_shelter_views(uuid) OWNER TO postgres;

-- 3. Explicitly Grant Execution to EVERYONE (including anonymous)
GRANT EXECUTE ON FUNCTION increment_pet_views(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_shelter_views(uuid) TO anon, authenticated, service_role;
