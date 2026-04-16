
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch onboarding data from the database by link ID
 */
export const fetchOnboardingData = async (linkId: string) => {
  console.log("Fetching onboarding data for link:", linkId);
  
  try {
    const { data, error } = await supabase
      .from('onboarding')
      .select('*')
      .eq('signup_link_id', linkId)
      .single();
      
    if (error) {
      console.error("Error fetching onboarding link:", error);
      return { data: null, error };
    }
    
    console.log("Onboarding data found:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Exception in fetchOnboardingData:", err);
    return { data: null, error: err };
  }
};

/**
 * Update onboarding record when user completes the onboarding process
 */
export const updateOnboardingRecord = async (linkId: string, profileSlug: string, userId: string) => {
  console.log(`Updating onboarding record - linkId: ${linkId}, userId: ${userId}, slug: ${profileSlug}`);
  
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('onboarding')
      .select('*')
      .eq('signup_link_id', linkId)
      .single();
      
    if (fetchError) {
      console.error("Error verifying existing onboarding record:", fetchError);
      return { success: false, error: fetchError };
    }
    
    console.log("Existing onboarding record before update:", existingData);
    
    // Update the onboarding record
    const { data, error: updateError } = await supabase
      .from('onboarding')
      .update({
        used: true,
        used_by: userId,
        used_at: new Date().toISOString(),
        profile_public_link: profileSlug
      })
      .eq('signup_link_id', linkId)
      .select();
      
    if (updateError) {
      console.error("Error updating onboarding record:", updateError);
      return { success: false, error: updateError };
    }
    
    console.log("Onboarding record updated successfully:", data);

    // If this is an event stand registration, create event participant and update stand
    if (existingData.registration_type === 'event_stand' && existingData.event_id && existingData.event_stand_id) {
      console.log("Processing event stand registration");

      // Create event participant with role 'stand'
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: existingData.event_id,
          user_id: userId,
          role: 'stand',
          status: 'confirmed',
          checked_in: false
        });

      if (participantError) {
        console.error("Error creating event participant:", participantError);
      } else {
        console.log("Event participant created successfully");
      }

      // Update event stand with assigned user and get profile info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', userId)
        .single();

      const { error: standError } = await supabase
        .from('event_stands')
        .update({ 
          assigned_user_id: userId,
          company_name: profileData?.name || null,
          company_email: profileData?.email || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.event_stand_id);

      if (standError) {
        console.error("Error updating event stand:", standError);
      } else {
        console.log("Event stand updated with assigned user");
      }
    }
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('onboarding')
      .select('*')
      .eq('signup_link_id', linkId)
      .single();
      
    if (verifyError) {
      console.error("Error verifying onboarding update:", verifyError);
    } else {
      console.log("Verified onboarding record after update:", verifyData);
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Exception in updateOnboardingRecord:", err);
    return { success: false, error: err };
  }
};
