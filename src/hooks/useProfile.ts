
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProfileData {
  id: string;
  name: string | null;
  headline: string | null;
  bio: string | null;
  email: string | null;
  linkedin: string | null;
  website: string | null;
  photo_url: string | null;
  slug: string | null;
  created_at: string | null;
  updated_at: string | null;
}

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
      let query;
      
      if (slug) {
        // Fetch by slug (for public profile)
        query = supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single();
      } else if (user) {
        // Fetch current user's profile
        query = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
      } else {
        throw new Error('No user or slug provided');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (updatedData: Partial<ProfileData>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // If updating slug, ensure it's unique
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
          return;
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file: File) => {
    if (!user) return;
    
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
      await updateProfile({ photo_url: data.publicUrl });
      
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      toast({
        title: "Error uploading photo",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
