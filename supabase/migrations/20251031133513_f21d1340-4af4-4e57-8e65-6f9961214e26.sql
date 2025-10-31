-- Fix security warnings for trigger functions by setting search_path
DROP FUNCTION IF EXISTS update_staking_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_staking_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_staking_pools_updated_at
  BEFORE UPDATE ON staking_pools
  FOR EACH ROW EXECUTE FUNCTION update_staking_updated_at();

CREATE TRIGGER update_user_stakes_updated_at
  BEFORE UPDATE ON user_stakes
  FOR EACH ROW EXECUTE FUNCTION update_staking_updated_at();