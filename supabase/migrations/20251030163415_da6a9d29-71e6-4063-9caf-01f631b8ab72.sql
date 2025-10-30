-- Make user_id nullable since we're using Flow wallet authentication
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add index on flow_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_flow_address ON public.profiles(flow_address);

-- Update existing profiles to have a unique constraint on flow_address
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_flow_address_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_flow_address_key UNIQUE (flow_address);