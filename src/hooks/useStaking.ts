import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./use-toast";

export interface StakingPool {
  id: string;
  name: string;
  description: string;
  base_apy: number;
  boosted_apy: number;
  min_stake: number;
  total_staked: number;
  duration_days: number;
  reward_frequency: string;
  perks: string[];
}

export interface UserStake {
  id: string;
  pool_id: string;
  amount: number;
  staked_at: string;
  unlock_at: string;
  status: string;
  total_rewards_claimed: number;
  staking_pools: {
    name: string;
    base_apy: number;
    boosted_apy: number;
    reward_frequency: string;
  };
}

export function useStaking() {
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [dcoinBalance, setDcoinBalance] = useState(0);
  const [stdcoinBalance, setStdcoinBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStakingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("get-staking-data");

      if (error) throw error;

      if (data) {
        setPools(data.pools || []);
        setUserStakes(data.stakes || []);
        setTotalStaked(data.total_staked || 0);
        setTotalRewards(data.total_rewards || 0);
        setDcoinBalance(data.dcoin_balance || 0);
        setStdcoinBalance(data.stdcoin_balance || 0);
      }
    } catch (error) {
      console.error("Error fetching staking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async (poolId: string, amount: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("stake-tokens", {
        body: { pool_id: poolId, amount },
      });

      if (error) throw error;

      toast({
        title: "Staking Successful! 🎉",
        description: data.message,
      });

      await fetchStakingData();
      return true;
    } catch (error: any) {
      console.error("Error staking tokens:", error);
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake tokens",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("claim-rewards");

      if (error) throw error;

      if (data.amount > 0) {
        toast({
          title: "Rewards Claimed! 🎉",
          description: data.message,
        });
      } else {
        toast({
          title: "No Rewards Available",
          description: "You don't have any rewards to claim yet.",
        });
      }

      await fetchStakingData();
      return true;
    } catch (error: any) {
      console.error("Error claiming rewards:", error);
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakingData();

    // Real-time updates for balance changes
    const channel = supabase
      .channel("staking-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_stakes",
        },
        () => {
          fetchStakingData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchStakingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pools,
    userStakes,
    totalStaked,
    totalRewards,
    dcoinBalance,
    stdcoinBalance,
    loading,
    stakeTokens,
    claimRewards,
    refetch: fetchStakingData,
  };
}