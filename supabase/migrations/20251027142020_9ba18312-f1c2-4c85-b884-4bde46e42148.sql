-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  dcoin_balance INTEGER DEFAULT 1000 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create livestreams table
CREATE TABLE public.livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  collaborator_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'live', 'ended')),
  current_round INTEGER DEFAULT 1 NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create livestream_rounds table
CREATE TABLE public.livestream_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID REFERENCES public.livestreams(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  creator_score INTEGER DEFAULT 0 NOT NULL,
  collaborator_score INTEGER DEFAULT 0 NOT NULL,
  winner_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed')),
  milestone INTEGER DEFAULT 1000 NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(livestream_id, round_number)
);

-- Create livestream_gifts table
CREATE TABLE public.livestream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID REFERENCES public.livestreams(id) ON DELETE CASCADE NOT NULL,
  round_id UUID REFERENCES public.livestream_rounds(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  to_creator_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  gift_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for livestreams
CREATE POLICY "Livestreams are viewable by everyone"
  ON public.livestreams FOR SELECT
  USING (true);

CREATE POLICY "Users can create livestreams"
  ON public.livestreams FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their livestreams"
  ON public.livestreams FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = collaborator_id);

-- RLS Policies for livestream_rounds
CREATE POLICY "Rounds are viewable by everyone"
  ON public.livestream_rounds FOR SELECT
  USING (true);

CREATE POLICY "System can manage rounds"
  ON public.livestream_rounds FOR ALL
  USING (true);

-- RLS Policies for livestream_gifts
CREATE POLICY "Gifts are viewable by everyone"
  ON public.livestream_gifts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send gifts"
  ON public.livestream_gifts FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for livestream updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestreams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestream_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestream_gifts;