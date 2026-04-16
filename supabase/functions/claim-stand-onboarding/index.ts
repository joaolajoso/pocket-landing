import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { linkId, userId } = await req.json()

    if (!linkId || !userId) {
      throw new Error('Missing linkId or userId')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch onboarding record
    const { data: onboardingData, error: fetchError } = await supabase
      .from('onboarding')
      .select('*')
      .eq('signup_link_id', linkId)
      .single()

    if (fetchError) throw fetchError

    // Double-claim protection: reject if already used
    if (onboardingData.used === true) {
      return new Response(
        JSON.stringify({ success: false, error: 'This card has already been claimed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('slug, name, email')
      .eq('id', userId)
      .single()

    // Update onboarding record with confirmed_at for consent proof
    const { error: updateError } = await supabase
      .from('onboarding')
      .update({
        used: true,
        used_by: userId,
        used_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        profile_public_link: profileData?.slug
      })
      .eq('signup_link_id', linkId)
      .eq('used', false) // Extra safety: only update if not yet used

    if (updateError) throw updateError

    // If event stand registration
    if (onboardingData.registration_type === 'event_stand' && onboardingData.event_id) {
      // Create event participant (idempotent)
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: onboardingData.event_id,
          user_id: userId,
          role: 'stand',
          status: 'confirmed',
          checked_in: false
        })

      if (participantError && participantError.code !== '23505') {
        console.error('Error creating participant:', participantError)
      }

      // Resolve stand id
      let standId = onboardingData.event_stand_id as string | null;
      if (!standId) {
        const { data: standLookup, error: standLookupError } = await supabase
          .from('event_stands')
          .select('id')
          .eq('onboarding_link_id', linkId)
          .eq('event_id', onboardingData.event_id)
          .single();
        if (standLookupError) {
          console.warn('Stand lookup by onboarding_link_id failed:', standLookupError);
        } else {
          standId = standLookup?.id ?? null;
        }
      }

      if (standId) {
        const { error: standError } = await supabase
          .from('event_stands')
          .update({
            assigned_user_id: userId,
            company_name: profileData?.name || null,
            company_email: profileData?.email || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', standId);

        if (standError) {
          console.error('Error updating stand:', standError)
        }
      } else {
        console.warn('No standId could be resolved for link:', linkId, 'event:', onboardingData.event_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
