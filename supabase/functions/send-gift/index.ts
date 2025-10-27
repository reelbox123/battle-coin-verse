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

    const { livestream_id, to_creator_id, amount, gift_type } = await req.json();

    // Get current profile and check balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('dcoin_balance')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    if (profile.dcoin_balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Get active round
    const { data: round, error: roundError } = await supabaseClient
      .from('livestream_rounds')
      .select('*')
      .eq('livestream_id', livestream_id)
      .eq('status', 'active')
      .single();

    if (roundError) throw roundError;

    // Deduct balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ dcoin_balance: profile.dcoin_balance - amount })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Record gift
    const { error: giftError } = await supabaseClient
      .from('livestream_gifts')
      .insert({
        livestream_id,
        round_id: round.id,
        from_user_id: user.id,
        to_creator_id,
        amount,
        gift_type,
      });

    if (giftError) throw giftError;

    // Get livestream to check creator/collaborator
    const { data: livestream } = await supabaseClient
      .from('livestreams')
      .select('creator_id, collaborator_id')
      .eq('id', livestream_id)
      .single();

    // Update round scores
    const isCreator = to_creator_id === livestream?.creator_id;
    const newCreatorScore = isCreator ? round.creator_score + amount : round.creator_score;
    const newCollaboratorScore = !isCreator ? round.collaborator_score + amount : round.collaborator_score;

    const { error: scoreError } = await supabaseClient
      .from('livestream_rounds')
      .update({
        creator_score: newCreatorScore,
        collaborator_score: newCollaboratorScore,
      })
      .eq('id', round.id);

    if (scoreError) throw scoreError;

    // Check if milestone reached
    const milestoneReached = newCreatorScore >= round.milestone || newCollaboratorScore >= round.milestone;
    let winner_id = null;

    if (milestoneReached) {
      winner_id = newCreatorScore > newCollaboratorScore ? livestream?.creator_id : livestream?.collaborator_id;

      // Complete current round
      await supabaseClient
        .from('livestream_rounds')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          winner_id,
        })
        .eq('id', round.id);

      // Create next round
      await supabaseClient
        .from('livestream_rounds')
        .insert({
          livestream_id,
          round_number: round.round_number + 1,
          creator_score: 0,
          collaborator_score: 0,
          status: 'active',
          milestone: round.milestone,
        });

      // Update livestream current_round
      await supabaseClient
        .from('livestreams')
        .update({ current_round: round.round_number + 1 })
        .eq('id', livestream_id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      milestone_reached: milestoneReached,
      winner_id,
      new_round: milestoneReached ? round.round_number + 1 : null,
    }), {
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
