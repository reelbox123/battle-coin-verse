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

    const { title, description, collaborator_id } = await req.json();

    // Create livestream
    const { data: livestream, error: livestreamError } = await supabaseClient
      .from('livestreams')
      .insert({
        creator_id: user.id,
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
