-- Function to allow users to delete their own account
-- This must be SECURITY DEFINER to allow access to auth.users table
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void AS $$
BEGIN
  -- 1. Delete the user from auth.users
  -- This will cascade to public.profiles if the foreign key is set up correctly (ON DELETE CASCADE)
  -- If not, we might need to delete public.profiles manually first.
  -- Safest is to try deleting from auth.users.
  
  -- Verify the user is deleting THEIR OWN account
  DELETE FROM auth.users
  WHERE id = auth.uid();
  
  -- If the deletion didn't happen (e.g. no auth.uid), valid.
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or not authorized to delete this account.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
