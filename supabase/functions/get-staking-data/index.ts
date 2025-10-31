import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get all staking pools
    const { data: pools, error: poolsError } = await supabase
      .from("staking_pools")
      .select("*")
      .eq("status", "active")
      .order("boosted_apy", { ascending: false });

    if (poolsError) throw poolsError;

    // Get user's stakes
    const { data: stakes, error: stakesError } = await supabase
      .from("user_stakes")
      .select(`
        *,
        staking_pools(name, base_apy, boosted_apy, reward_frequency)
      `)
      .eq("user_id", user.id)
      .eq("status", "active");

    if (stakesError) throw stakesError;

    // Get user's unclaimed rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("staking_rewards")
      .select("amount")
      .eq("user_id", user.id)
      .eq("claimed", false);

    if (rewardsError) throw rewardsError;

    const totalRewards = rewards?.reduce((sum, r) => sum + r.amount, 0) || 0;

    // Get user's balances
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dcoin_balance, stdcoin_balance")
      .eq("user_id", user.id)
      .single();

    if (profileError) throw profileError;

    // Calculate total staked
    const totalStaked = stakes?.reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;

    return new Response(
      JSON.stringify({ 
        success: true,
        pools: pools || [],
        stakes: stakes || [],
        total_staked: totalStaked,
        total_rewards: totalRewards,
        dcoin_balance: profile?.dcoin_balance || 0,
        stdcoin_balance: profile?.stdcoin_balance || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Get staking data error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});