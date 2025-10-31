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

    const { pool_id, amount } = await req.json();

    console.log(`Staking request: user=${user.id}, pool=${pool_id}, amount=${amount}`);

    // Get user's dCoin balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dcoin_balance")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (profile.dcoin_balance < amount) {
      throw new Error("Insufficient dCoin balance");
    }

    // Get pool details
    const { data: pool, error: poolError } = await supabase
      .from("staking_pools")
      .select("*")
      .eq("id", pool_id)
      .single();

    if (poolError || !pool) {
      throw new Error("Pool not found");
    }

    if (amount < pool.min_stake) {
      throw new Error(`Minimum stake is ${pool.min_stake} dCoin`);
    }

    // Deduct dCoin from user
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ dcoin_balance: profile.dcoin_balance - amount })
      .eq("user_id", user.id);

    if (balanceError) throw balanceError;

    // Calculate unlock date
    const unlock_at = new Date();
    unlock_at.setDate(unlock_at.getDate() + pool.duration_days);

    // Create stake
    const { data: stake, error: stakeError } = await supabase
      .from("user_stakes")
      .insert({
        user_id: user.id,
        pool_id,
        amount,
        unlock_at: unlock_at.toISOString(),
        status: 'active',
        auto_compound: true,
      })
      .select()
      .single();

    if (stakeError) throw stakeError;

    // Update pool total staked
    await supabase
      .from("staking_pools")
      .update({ total_staked: (pool.total_staked || 0) + amount })
      .eq("id", pool_id);

    // Schedule auto-compound with Flow Forte
    const nextCompound = new Date();
    nextCompound.setDate(nextCompound.getDate() + (pool.reward_frequency === 'daily' ? 1 : 7));

    await supabase.from("compound_schedule").insert({
      stake_id: stake.id,
      user_id: user.id,
      next_compound_at: nextCompound.toISOString(),
      frequency: pool.reward_frequency === 'daily' ? 'daily' : 'weekly',
      status: 'active',
    });

    console.log(`Stake created successfully: ${stake.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        stake,
        message: `Successfully staked ${amount} dCoin!`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Staking error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});