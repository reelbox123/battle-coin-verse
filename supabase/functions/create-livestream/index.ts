import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, description, collaborator_id, flow_address } = await req.json();

    if (!flow_address) {
      return new Response(
        JSON.stringify({ error: "Flow address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Creating livestream for Flow address:", flow_address);

    // Get or create user profile
    let { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_id, username')
      .eq('flow_address', flow_address)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const username = `user_${flow_address.slice(-8)}`;
      const { data: newProfile, error: createError } = await supabaseClient
        .from('profiles')
        .insert({
          username: username,
          flow_address: flow_address,
          dcoin_balance: 0,
        })
        .select('user_id, username')
        .single();

      if (createError) throw createError;
      profile = newProfile;
    }

    // Create livestream
    const { data: livestream, error: livestreamError } = await supabaseClient
      .from('livestreams')
      .insert({
        creator_id: profile.user_id,
        collaborator_id: collaborator_id || null,
        title,
        description,
        status: 'live',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (livestreamError) throw livestreamError;

    // Create first round
    const { error: roundError } = await supabaseClient
      .from('livestream_rounds')
      .insert({
        livestream_id: livestream.id,
        round_number: 1,
        creator_score: 0,
        collaborator_score: 0,
        status: 'active',
        milestone: 1000,
      });

    if (roundError) throw roundError;

    console.log("Livestream created successfully:", livestream.id);

    return new Response(JSON.stringify({ success: true, livestream }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
