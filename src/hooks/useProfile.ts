
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

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile
  };
};
