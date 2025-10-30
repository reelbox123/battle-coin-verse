import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { flow_address } = await req.json();

    if (!flow_address) {
      return new Response(JSON.stringify({ error: "Flow address is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Claiming tokens for Flow address:", flow_address);

    // Check if user has already claimed tokens
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dcoin_balance, flow_address, user_id")
      .eq("flow_address", flow_address)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    // If profile doesn't exist, create it with initial tokens
    if (!profile) {
      // Generate a username from the flow address
      const username = `user_${flow_address.slice(-8)}`;
      
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          username: username,
          dcoin_balance: 1000, // Initial token grant
          flow_address: flow_address,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("New user claimed tokens:", flow_address);

      return new Response(
        JSON.stringify({
          success: true,
          tokens_claimed: 1000,
          total_balance: 1000,
          message: "Welcome bonus claimed!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User already claimed, return current balance
    console.log("User already claimed tokens:", flow_address, "Balance:", profile.dcoin_balance);
    
    return new Response(
      JSON.stringify({
        success: true,
        tokens_claimed: 0,
        total_balance: profile.dcoin_balance,
        message: "Tokens already claimed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in claim-tokens:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
