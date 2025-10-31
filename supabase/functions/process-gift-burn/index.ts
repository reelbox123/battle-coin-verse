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

    const { gift_id, dcoin_amount, auto_stake_percent = 50 } = await req.json();

    console.log(`Processing gift burn: user=${user.id}, amount=${dcoin_amount}`);

    // Burn dCoin → Mint stdCoin (1:1 ratio)
    const stdcoin_minted = dcoin_amount;
    
    // Calculate auto-stake amount (default 50%)
    const auto_stake_amount = stdcoin_minted * (auto_stake_percent / 100);
    const liquid_amount = stdcoin_minted - auto_stake_amount;

    // Update user's stdCoin balance (liquid portion)
    const { data: profile } = await supabase
      .from("profiles")
      .select("stdcoin_balance")
      .eq("user_id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({ 
        stdcoin_balance: (profile?.stdcoin_balance || 0) + liquid_amount 
      })
      .eq("user_id", user.id);

    let stake_id = null;

    // Auto-stake portion if enabled
    if (auto_stake_amount > 0) {
      // Get default staking pool (Battle Legends)
      const { data: pool } = await supabase
        .from("staking_pools")
        .select("*")
        .eq("name", "Battle Legends")
        .single();

      if (pool && auto_stake_amount >= pool.min_stake) {
        const unlock_at = new Date();
        unlock_at.setDate(unlock_at.getDate() + pool.duration_days);

        const { data: stake } = await supabase
          .from("user_stakes")
          .insert({
            user_id: user.id,
            pool_id: pool.id,
            amount: auto_stake_amount,
            unlock_at: unlock_at.toISOString(),
            status: 'active',
            auto_compound: true,
          })
          .select()
          .single();

        if (stake) {
          stake_id = stake.id;

          // Update pool total
          await supabase
            .from("staking_pools")
            .update({ total_staked: (pool.total_staked || 0) + auto_stake_amount })
            .eq("id", pool.id);

          // Schedule auto-compound
          const nextCompound = new Date();
          nextCompound.setDate(nextCompound.getDate() + 1); // Daily

          await supabase.from("compound_schedule").insert({
            stake_id: stake.id,
            user_id: user.id,
            next_compound_at: nextCompound.toISOString(),
            frequency: 'daily',
            status: 'active',
          });
        }
      }
    }

    // Log the burn action
    await supabase.from("gift_burn_log").insert({
      gift_id,
      user_id: user.id,
      dcoin_burned: dcoin_amount,
      stdcoin_minted,
      auto_staked: auto_stake_amount > 0,
      stake_id,
    });

    console.log(`Burned ${dcoin_amount} dCoin → Minted ${stdcoin_minted} stdCoin (${auto_stake_amount} auto-staked)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        dcoin_burned: dcoin_amount,
        stdcoin_minted,
        auto_staked: auto_stake_amount,
        liquid_amount,
        stake_id,
        message: `Burned ${dcoin_amount} dCoin → ${stdcoin_minted} stdCoin (${auto_stake_amount} auto-staked)`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Gift burn error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});