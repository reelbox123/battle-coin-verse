-- Add stdCoin balance to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stdcoin_balance NUMERIC DEFAULT 0;

-- Create staking pools table
CREATE TABLE IF NOT EXISTS staking_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_apy NUMERIC NOT NULL,
  boosted_apy NUMERIC NOT NULL,
  min_stake NUMERIC NOT NULL,
  total_staked NUMERIC DEFAULT 0,
  duration_days INTEGER NOT NULL,
  reward_frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  status TEXT DEFAULT 'active',
  perks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user stakes table
CREATE TABLE IF NOT EXISTS user_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  pool_id UUID REFERENCES staking_pools NOT NULL,
  amount NUMERIC NOT NULL,
  staked_at TIMESTAMPTZ DEFAULT now(),
  unlock_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'unstaked'
  total_rewards_claimed NUMERIC DEFAULT 0,
  auto_compound BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create staking rewards table
CREATE TABLE IF NOT EXISTS staking_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id UUID REFERENCES user_stakes NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  reward_type TEXT NOT NULL, -- 'standard', 'compound', 'boost'
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create compound schedule table for Flow Forte automation
CREATE TABLE IF NOT EXISTS compound_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id UUID REFERENCES user_stakes NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  next_compound_at TIMESTAMPTZ NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly'
  status TEXT DEFAULT 'active',
  last_compound_at TIMESTAMPTZ,
  total_compounds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create gift burn log for action chains
CREATE TABLE IF NOT EXISTS gift_burn_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID,
  user_id UUID REFERENCES auth.users NOT NULL,
  dcoin_burned NUMERIC NOT NULL,
  stdcoin_minted NUMERIC NOT NULL,
  auto_staked BOOLEAN DEFAULT false,
  stake_id UUID REFERENCES user_stakes,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE staking_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE compound_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_burn_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staking_pools
CREATE POLICY "Pools are viewable by everyone" ON staking_pools FOR SELECT USING (true);
CREATE POLICY "Only admins can manage pools" ON staking_pools FOR ALL USING (false);

-- RLS Policies for user_stakes
CREATE POLICY "Users can view their own stakes" ON user_stakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own stakes" ON user_stakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stakes" ON user_stakes FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for staking_rewards
CREATE POLICY "Users can view their own rewards" ON staking_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create rewards" ON staking_rewards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their rewards" ON staking_rewards FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for compound_schedule
CREATE POLICY "Users can view their own schedule" ON compound_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage schedule" ON compound_schedule FOR ALL USING (true);

-- RLS Policies for gift_burn_log
CREATE POLICY "Users can view their own burn log" ON gift_burn_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create burn logs" ON gift_burn_log FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_stakes_user_id ON user_stakes(user_id);
CREATE INDEX idx_user_stakes_pool_id ON user_stakes(pool_id);
CREATE INDEX idx_staking_rewards_user_id ON staking_rewards(user_id);
CREATE INDEX idx_staking_rewards_stake_id ON staking_rewards(stake_id);
CREATE INDEX idx_compound_schedule_next_at ON compound_schedule(next_compound_at);
CREATE INDEX idx_gift_burn_log_user_id ON gift_burn_log(user_id);

-- Insert default staking pools
INSERT INTO staking_pools (name, description, base_apy, boosted_apy, min_stake, duration_days, reward_frequency, perks) VALUES
('Battle Legends', 'High APY pool for battle enthusiasts', 18, 25, 100, 30, 'daily', '["Priority battle access", "Exclusive gifts", "2x voting power"]'),
('Creator Support', 'Support your favorite creators', 15, 22, 50, 14, 'weekly', '["Support creators", "Special badges", "Early access"]'),
('Community Growth', 'Maximum rewards for long-term stakers', 20, 28, 500, 90, 'daily', '["Maximum APY", "Governance rights", "VIP status"]');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_staking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staking_pools_updated_at
  BEFORE UPDATE ON staking_pools
  FOR EACH ROW EXECUTE FUNCTION update_staking_updated_at();

CREATE TRIGGER update_user_stakes_updated_at
  BEFORE UPDATE ON user_stakes
  FOR EACH ROW EXECUTE FUNCTION update_staking_updated_at();