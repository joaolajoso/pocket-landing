
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/lib/supabase';

export interface ProfileData extends Profile {}

export const useProfile = (slug?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (slug) {
        // Fetch by slug (for public profile)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } else if (user) {
        // Fetch current user's profile
        console.log("Fetching profile for user ID:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        console.log("Fetched profile data:", data);
        setProfile(data);
      } else {
        throw new Error('No user or slug provided');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (updatedData: Partial<ProfileData>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log("Updating profile with data:", updatedData);
      
      // If updating slug, ensure it's unique and URL-friendly
      if (updatedData.slug) {
        // Create URL-friendly slug
        updatedData.slug = updatedData.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if slug is already taken
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', updatedData.slug)
          .neq('id', user.id)
          .single();
        
        if (data) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
      }
      
      // Include updated_at timestamp
      const dataWithTimestamp = {
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(dataWithTimestamp)
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      // Update local state with new data
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
      return true;
      
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file: File): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);
      
      // Update profile with new photo URL
      const success = await updateProfile({ 
        photo_url: data.publicUrl,
        updated_at: new Date().toISOString()
      });
      
      return success;
      
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      toast({
        title: "Error uploading photo",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription to profile changes
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, payload => {
        console.log('Profile updated in real-time:', payload);
        setProfile(payload.new as ProfileData);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Load profile data on mount or when slug/user changes
  useEffect(() => {
    if (user || slug) {
      fetchProfile();
    }
  }, [user?.id, slug]);

  return { 
    profile,
    loading,
    error,
    updateProfile,
    uploadProfilePhoto,
    refreshProfile: fetchProfile
  };
};
