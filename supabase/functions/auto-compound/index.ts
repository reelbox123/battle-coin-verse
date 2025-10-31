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

    console.log("Running auto-compound for all due stakes...");

    // Get all compound schedules that are due
    const now = new Date().toISOString();
    const { data: schedules, error: scheduleError } = await supabase
      .from("compound_schedule")
      .select(`
        *,
        user_stakes!inner(
          id,
          amount,
          pool_id,
          user_id,
          staking_pools!inner(
            boosted_apy,
            reward_frequency
          )
        )
      `)
      .eq("status", "active")
      .lte("next_compound_at", now);

    if (scheduleError) throw scheduleError;

    console.log(`Found ${schedules?.length || 0} stakes ready for compounding`);

    for (const schedule of schedules || []) {
      try {
        const stake = schedule.user_stakes;
        const pool = stake.staking_pools;
        
        // Calculate rewards based on boosted APY (auto-compound boost)
        const dailyRate = pool.boosted_apy / 100 / 365;
        const rewardAmount = stake.amount * dailyRate;

        // Create reward record
        await supabase.from("staking_rewards").insert({
          stake_id: stake.id,
          user_id: stake.user_id,
          amount: rewardAmount,
          reward_type: 'compound',
          claimed: false,
        });

        // Add rewards to stdCoin balance (auto-minted from dCoin rewards)
        const { data: profile } = await supabase
          .from("profiles")
          .select("stdcoin_balance")
          .eq("user_id", stake.user_id)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ 
              stdcoin_balance: (profile.stdcoin_balance || 0) + rewardAmount 
            })
            .eq("user_id", stake.user_id);
        }

        // Update compound schedule
        const nextCompound = new Date();
        const daysToAdd = pool.reward_frequency === 'daily' ? 1 : 7;
        nextCompound.setDate(nextCompound.getDate() + daysToAdd);

        await supabase
          .from("compound_schedule")
          .update({
            next_compound_at: nextCompound.toISOString(),
            last_compound_at: now,
            total_compounds: schedule.total_compounds + 1,
          })
          .eq("id", schedule.id);

        console.log(`Compounded ${rewardAmount} stdCoin for stake ${stake.id}`);
      } catch (error) {
        console.error(`Error compounding stake ${schedule.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        compounded: schedules?.length || 0,
        message: "Auto-compound completed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Auto-compound error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});