import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFlowUser } from "./useFlowUser";
import { toast } from "./use-toast";

export function useTokenBalance() {
  const { user } = useFlowUser();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [flowAddress, setFlowAddress] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!user.loggedIn || !user.addr) {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("get-token-balance", {
        body: { flow_address: user.addr },
      });

      if (error) throw error;

      setBalance(data.balance || 0);
      setFlowAddress(data.flow_address);
    } catch (error) {
      console.error("Error fetching token balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimTokens = async () => {
    if (!user.loggedIn || !user.addr) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Flow wallet first",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("claim-tokens", {
        body: { flow_address: user.addr },
      });

      if (error) throw error;

      if (data.tokens_claimed > 0) {
        toast({
          title: "Tokens Claimed! 🎉",
          description: `You received ${data.tokens_claimed} DBT tokens!`,
        });
      }

      setBalance(data.total_balance);
      setFlowAddress(user.addr);
      return true;
    } catch (error) {
      console.error("Error claiming tokens:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim tokens",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Subscribe to profile changes for real-time balance updates
    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.loggedIn]);

  return { balance, loading, claimTokens, fetchBalance, flowAddress };
}
