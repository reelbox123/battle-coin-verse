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

    const { livestream_id, status, flow_address } = await req.json();

    if (!livestream_id || !status || !flow_address) {
      throw new Error('Missing required fields');
    }

    console.log('Updating livestream status:', livestream_id, status, 'for', flow_address);

    // Get profile by flow_address
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('flow_address', flow_address)
      .single();

    if (profileError) throw profileError;

    // Verify ownership before updating
    const { data: owningStream, error: streamError } = await supabaseClient
      .from('livestreams')
      .select('id, creator_id')
      .eq('id', livestream_id)
      .single();

    if (streamError) throw streamError;
    
    if (!owningStream || owningStream.creator_id !== profile.id) {
      throw new Error('Not authorized to update this livestream');
    }

    // Update livestream status
    const { data: livestream, error } = await supabaseClient
      .from('livestreams')
      .update({
        status,
        ended_at: status === 'ended' ? new Date().toISOString() : null,
      })
      .eq('id', livestream_id)
      .select()
      .single();

    if (error) throw error;

    // If ending, close all active rounds
    if (status === 'ended') {
      await supabaseClient
        .from('livestream_rounds')
        .update({ status: 'completed' })
        .eq('livestream_id', livestream_id)
        .eq('status', 'active');
    }

    return new Response(
      JSON.stringify({ success: true, livestream }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
