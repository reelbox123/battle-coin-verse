-- Fix foreign keys for livestreams to reference profiles.id instead of profiles.user_id
-- Drop existing incorrect foreign keys if they reference the wrong column
ALTER TABLE public.livestreams DROP CONSTRAINT IF EXISTS livestreams_creator_id_fkey;
ALTER TABLE public.livestreams DROP CONSTRAINT IF EXISTS livestreams_collaborator_id_fkey;

-- Re-create foreign keys to point to profiles.id
ALTER TABLE public.livestreams
  ADD CONSTRAINT livestreams_creator_id_fkey
  FOREIGN KEY (creator_id)
  REFERENCES public.profiles (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE public.livestreams
  ADD CONSTRAINT livestreams_collaborator_id_fkey
  FOREIGN KEY (collaborator_id)
  REFERENCES public.profiles (id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_livestreams_creator_id ON public.livestreams(creator_id);
CREATE INDEX IF NOT EXISTS idx_livestreams_collaborator_id ON public.livestreams(collaborator_id);