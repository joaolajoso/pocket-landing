
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/lib/supabase';

export interface ProfileData extends Profile {}

export const useProfileData = (slug?: string) => {
  const { user } = useAuth();
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
        if (data) setProfile(data as ProfileData);
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
        if (data) setProfile(data as ProfileData);
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
    refreshProfile: fetchProfile
  };
};
