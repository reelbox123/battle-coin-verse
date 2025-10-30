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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { livestream_id, status } = await req.json();

    if (!livestream_id || !status) {
      throw new Error('Missing required fields');
    }

    // Update livestream status
    const { data: livestream, error } = await supabaseClient
      .from('livestreams')
      .update({
        status,
        ended_at: status === 'ended' ? new Date().toISOString() : null,
      })
      .eq('id', livestream_id)
      .eq('creator_id', user.id)
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
