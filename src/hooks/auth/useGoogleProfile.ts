import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleProfileData {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export const useGoogleProfile = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadGoogleImageViaEdgeFunction = async (imageUrl: string, userId: string): Promise<string | null> => {
    try {
      console.log('[Google] Uploading image via edge function:', imageUrl);
      
      const { data, error } = await supabase.functions.invoke('download-linkedin-image', {
        body: { imageUrl, userId }
      });

      if (error) {
        console.error('[Google] Edge function error:', error);
        return null;
      }

      if (data?.publicUrl) {
        console.log('[Google] Image uploaded successfully:', data.publicUrl);
        return data.publicUrl;
      }

      return null;
    } catch (error) {
      console.error('[Google] Error calling edge function:', error);
      return null;
    }
  };

  const saveGoogleProfile = async (user: any): Promise<void> => {
    try {
      setLoading(true);
      console.log('[Google] Processing Google profile data for user:', user.id);

      // Check if already processed in this session
      const sessionKey = `google_profile_processed_${user.id}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log('[Google] Profile already processed in this session');
        return;
      }

      // Get Google identity data
      const identities = user.identities || [];
      const googleIdentity = identities.find((id: any) => id.provider === 'google');
      
      if (!googleIdentity) {
        console.log('[Google] No Google identity found');
        return;
      }

      const googleData: GoogleProfileData = googleIdentity.identity_data || {};
      console.log('[Google] Google identity data:', googleData);

      // Check current profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, photo_url')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[Google] Error fetching profile:', profileError);
        throw profileError;
      }

      // Prepare update data
      const updates: any = {};
      
      // Update name if empty
      if (!profile?.name && googleData.name) {
        updates.name = googleData.name;
      }

      // Update email if empty
      if (!profile?.email && googleData.email) {
        updates.email = googleData.email;
      }

      // Upload photo if available and profile doesn't have one
      if (!profile?.photo_url && googleData.picture) {
        const uploadedUrl = await uploadGoogleImageViaEdgeFunction(googleData.picture, user.id);
        if (uploadedUrl) {
          updates.photo_url = uploadedUrl;
        }
      }

      // Update profile if there are changes
      if (Object.keys(updates).length > 0) {
        console.log('[Google] Updating profile with:', updates);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (updateError) {
          console.error('[Google] Error updating profile:', updateError);
          throw updateError;
        }

        toast({
          title: "Profile updated",
          description: "Your profile has been updated with data from Google.",
        });
      } else {
        console.log('[Google] No updates needed');
      }

      // Mark as processed
      sessionStorage.setItem(sessionKey, 'true');

    } catch (error) {
      console.error('[Google] Error saving profile:', error);
      toast({
        title: "Profile update failed",
        description: "Could not update your profile with Google data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    saveGoogleProfile,
    loading
  };
};
