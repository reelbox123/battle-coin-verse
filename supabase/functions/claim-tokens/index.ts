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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { flow_address } = await req.json();

    if (!flow_address) {
      return new Response(JSON.stringify({ error: "Flow address is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has already claimed tokens
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dcoin_balance, flow_address")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    // If profile doesn't exist, create it with initial tokens
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          username: user.email?.split("@")[0] || "user",
          dcoin_balance: 1000, // Initial token grant
          flow_address: flow_address,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("New user claimed tokens:", user.id, flow_address);

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

    // If user already has a profile but no flow_address, update it
    if (!profile.flow_address) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ flow_address: flow_address })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    }

    // User already claimed, return current balance
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
