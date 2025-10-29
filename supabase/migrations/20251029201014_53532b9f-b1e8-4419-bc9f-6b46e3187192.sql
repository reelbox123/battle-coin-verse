-- Add flow_address column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'flow_address'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN flow_address TEXT;
  END IF;
END $$;

-- Create index on flow_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_flow_address ON public.profiles(flow_address);