
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
        // Fetch by username/slug
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', username)
          .maybeSingle();

        if (error) throw error;
        profileData = data;
      } else if (user) {
        // Fetch the logged-in user's profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        profileData = data;
      }

      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, username]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Set up real-time subscription
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
        // @ts-ignore - new record might not match Profile type exactly but that's ok
        setProfile(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, username]);

  // Add the update profile function
  const updateProfile = async (updateData: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Add the upload photo function
  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);
        
      if (!urlData.publicUrl) throw new Error('Failed to get public URL');
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, photo_url: urlData.publicUrl } : null);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Add the delete photo function
  const deleteProfilePhoto = async (): Promise<boolean> => {
    if (!user || !profile?.photo_url) return false;
    
    try {
      setLoading(true);
      
      // Extract file path from URL
      const photoUrl = profile.photo_url;
      const pathMatch = photoUrl.match(/\/([^/]+\/[^/]+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('profile_photos')
          .remove([filePath]);
          
        if (deleteError) throw deleteError;
      }
      
      // Update profile to remove photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, photo_url: null } : null);
      
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
