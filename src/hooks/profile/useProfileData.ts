import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileData {
  id: string;
  updated_at: string;
  created_at: string;
  name: string | null;
  username: string | null; // This is the equivalent of slug
  bio: string | null;
  photo_url: string | null;
  avatar_url: string | null; // For backward compatibility
  headline: string | null;
  job_title: string | null; // For backward compatibility
  linkedin: string | null;
  website: string | null;
  email: string | null;
  // Title fields
  linkedin_title: string | null;
  website_title: string | null;
  email_title: string | null;
  theme_id: string | null;
  custom_theme: any;
  view_count: number;
  link_click_count: number;
  card_created: boolean;
  links_added: boolean;
  design_customized: boolean;
  settings_filled: boolean;
  phone: string | null;
  location: string | null;
  // For backward compatibility
  slug: string | null;
  allow_network_saves: boolean;
  // Privacy settings
  phone_number: string | null;
  share_email_publicly: boolean;
  share_phone_publicly: boolean;
}

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
        if (data) {
          // Map database fields to ProfileData
          const profileData: ProfileData = {
            ...data,
            username: data.slug, // Map slug to username for compatibility
            id: data.id,
            updated_at: data.updated_at || new Date().toISOString(),
            created_at: data.created_at || new Date().toISOString(),
            view_count: 0,
            link_click_count: 0,
            card_created: false,
            links_added: false,
            design_customized: false,
            settings_filled: false,
            theme_id: null,
            custom_theme: null,
            linkedin_title: null,
            website_title: null,
            email_title: null,
            phone: null,
            location: null
          };
          setProfile(profileData);
        }
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
        if (data) {
          // Map database fields to ProfileData
          const profileData: ProfileData = {
            ...data,
            username: data.slug, // Map slug to username for compatibility
            id: data.id,
            updated_at: data.updated_at || new Date().toISOString(),
            created_at: data.created_at || new Date().toISOString(),
            view_count: 0,
            link_click_count: 0,
            card_created: false,
            links_added: false,
            design_customized: false,
            settings_filled: false,
            theme_id: null,
            custom_theme: null,
            linkedin_title: null,
            website_title: null,
            email_title: null,
            phone: null,
            location: null
          };
          setProfile(profileData);
        }
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
        // Update profile with new data, maintaining the ProfileData structure
        if (payload.new) {
          const newData = payload.new as any;
          setProfile(prev => {
            if (!prev) return null;
            return {
              ...prev,
              ...newData,
              username: newData.slug // Map slug to username for compatibility
            };
          });
        }
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
