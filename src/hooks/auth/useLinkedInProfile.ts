
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LinkedInProfileData {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
  locale?: string;
}

export const useLinkedInProfile = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveLinkedInProfile = async (user: any) => {
    if (!user) {
      console.log('No user provided to saveLinkedInProfile');
      return;
    }

    // Prevent multiple calls for the same user
    const processingKey = `linkedin_processing_${user.id}`;
    if (sessionStorage.getItem(processingKey)) {
      console.log('LinkedIn profile already being processed for user:', user.id);
      return;
    }

    try {
      setLoading(true);
      sessionStorage.setItem(processingKey, 'true');
      
      console.log('Processing LinkedIn user data:', user);

      // Extract LinkedIn data from user metadata and identity data
      const userData = user.user_metadata || {};
      const identities = user.identities || [];
      const linkedinIdentity = identities.find((id: any) => id.provider === 'linkedin_oidc');

      if (!linkedinIdentity) {
        console.log('No LinkedIn identity found');
        return;
      }

      const identityData = linkedinIdentity.identity_data || {};
      console.log('LinkedIn identity data:', identityData);

      // LinkedIn OpenID Connect provides data in identity_data
      const profileData: Partial<LinkedInProfileData> = {
        sub: identityData.sub || '',
        name: identityData.name || userData.name || userData.full_name || '',
        given_name: identityData.given_name || userData.given_name || '',
        family_name: identityData.family_name || userData.family_name || '',
        email: identityData.email || user.email || '',
        email_verified: identityData.email_verified || false,
        picture: identityData.picture || userData.picture || userData.avatar_url || '',
        locale: identityData.locale || userData.locale || '',
      };

      console.log('Processed LinkedIn profile data:', profileData);

      // Check if profile already exists and has LinkedIn data
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('name, email, photo_url, linkedin')
        .eq('id', user.id)
        .single();

      // Only update if we have new data or missing data
      const shouldUpdateProfile = !existingProfile || 
        !existingProfile.name || 
        !existingProfile.photo_url ||
        !existingProfile.linkedin;

      if (!shouldUpdateProfile) {
        console.log('LinkedIn profile already complete for user:', user.id);
        return;
      }

      // Update the user's profile with LinkedIn data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Update name if available and not already set
      if (profileData.name && (!existingProfile?.name || existingProfile.name.trim() === '')) {
        updateData.name = profileData.name;
      }

      // Update email if available and not already set
      if (profileData.email && (!existingProfile?.email || existingProfile.email.trim() === '')) {
        updateData.email = profileData.email;
      }

      // Add LinkedIn URL (using sub as unique identifier for LinkedIn profiles)
      if (profileData.sub) {
        updateData.linkedin = `https://www.linkedin.com/in/${profileData.sub}`;
      }

      // Handle profile picture upload if available
      if (profileData.picture) {
        try {
          const imageUrl = await uploadLinkedInImageViaEdgeFunction(profileData.picture, user.id);
          if (imageUrl) {
            updateData.photo_url = imageUrl;
          }
        } catch (error) {
          console.error('Error uploading LinkedIn profile image:', error);
          // Continue without the image if upload fails
        }
      }

      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('LinkedIn profile data saved successfully');

    } catch (error: any) {
      console.error('Error saving LinkedIn profile:', error);
      toast({
        title: "Error saving LinkedIn profile",
        description: error.message || "Failed to save LinkedIn profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      sessionStorage.removeItem(processingKey);
    }
  };

  const uploadLinkedInImageViaEdgeFunction = async (imageUrl: string, userId: string): Promise<string | null> => {
    try {
      console.log('Uploading LinkedIn image via edge function:', imageUrl);

      const response = await supabase.functions.invoke('download-linkedin-image', {
        body: {
          imageUrl: imageUrl,
          userId: userId
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        return null;
      }

      if (response.data && response.data.publicUrl) {
        console.log('Image uploaded successfully via edge function:', response.data.publicUrl);
        return response.data.publicUrl;
      }

      console.error('No public URL returned from edge function');
      return null;

    } catch (error) {
      console.error('Error calling edge function:', error);
      return null;
    }
  };

  return {
    saveLinkedInProfile,
    loading
  };
};
