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
      return new Response(
        JSON.stringify({ error: "Flow address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Fetching balance for Flow address:", flow_address);

    // Get user's token balance from profile by flow_address
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dcoin_balance, flow_address")
      .eq("flow_address", flow_address)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Profile doesn't exist yet
        console.log("Profile not found for address:", flow_address);
        return new Response(
          JSON.stringify({ balance: 0, flow_address }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw profileError;
    }

    console.log("Balance found:", profile.dcoin_balance);

    return new Response(
      JSON.stringify({
        balance: profile.dcoin_balance || 0,
        flow_address: profile.flow_address,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-token-balance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
