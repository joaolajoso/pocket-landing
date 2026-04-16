import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  name: string;
  bio: string;
  headline: string;
  photo_url: string;
  avatar_url: string;
  job_title: string;
  slug: string;
  email: string;
  linkedin: string;
  website: string;
  created_at: string;
  updated_at: string;
  allow_network_saves: boolean;
  phone_number?: string;
  links_disclaimer_accepted?: boolean;
  lead_capture_enabled: boolean;
  share_email_publicly?: boolean;
  share_phone_publicly?: boolean;
  use_new_public_page?: boolean;
}

export const useProfile = (username?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let profileData;

      if (username) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', username)
          .maybeSingle();

        if (error) throw error;
        profileData = data;
      } else if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        profileData = data;
      }

      setProfile(profileData as Profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: username 
          ? `slug=eq.${username}` 
          : `id=eq.${user.id}`
      }, (payload) => {
        console.log('Profile changed:', payload);
        setProfile(payload.new as Profile);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, username]);

  const updateProfile = async (updateData: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      if (profile) {
        setProfile({ ...profile, ...updateData });
      }
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);
        
      if (!urlData.publicUrl) throw new Error('Failed to get public URL');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      if (profile) {
        setProfile({ ...profile, photo_url: urlData.publicUrl });
      }
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProfilePhoto = async (): Promise<boolean> => {
    if (!user || !profile?.photo_url) return false;
    
    try {
      setLoading(true);
      
      const photoUrl = profile.photo_url;
      const pathMatch = photoUrl.match(/\/([^/]+\/[^/]+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        
        const { error: deleteError } = await supabase.storage
          .from('profile_photos')
          .remove([filePath]);
          
        if (deleteError) throw deleteError;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      if (profile) {
        setProfile({ ...profile, photo_url: null });
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting profile photo:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateProfile,
    uploadProfilePhoto,
    deleteProfilePhoto
  };
};
