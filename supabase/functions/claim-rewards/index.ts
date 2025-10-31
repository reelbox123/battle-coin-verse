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

    console.log(`Claiming rewards for user ${user.id}`);

    // Get all unclaimed rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("staking_rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("claimed", false);

    if (rewardsError) throw rewardsError;

    if (!rewards || rewards.length === 0) {
      return new Response(
        JSON.stringify({ success: true, amount: 0, message: "No rewards to claim" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);

    // Mark rewards as claimed
    const rewardIds = rewards.map(r => r.id);
    await supabase
      .from("staking_rewards")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .in("id", rewardIds);

    // Add to user's stdCoin balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("stdcoin_balance")
      .eq("user_id", user.id)
      .single();

    const newBalance = (profile?.stdcoin_balance || 0) + totalRewards;

    await supabase
      .from("profiles")
      .update({ stdcoin_balance: newBalance })
      .eq("user_id", user.id);

    console.log(`Claimed ${totalRewards} stdCoin for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        amount: totalRewards,
        new_balance: newBalance,
        message: `Successfully claimed ${totalRewards.toFixed(2)} stdCoin!`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Claim rewards error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});