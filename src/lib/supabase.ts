
import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xhcqhmbhivxbwnoifcoc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getProfileViewStats = async (profileId: string) => {
  try {
    const { data, error } = await supabase.from('profile_views_stats').select('*').eq('profile_id', profileId).single();

    if (error) {
      console.error('Error fetching profile views:', error);
      return { total: 0, lastWeek: 0 };
    }

    return data || { total: 0, lastWeek: 0 };
  } catch (error) {
    console.error('Error fetching profile views:', error);
    return { total: 0, lastWeek: 0 };
  }
};

export const getProfileUrl = (slug: string) => {
  // Use window.location instead of process.env for client-side URL generation
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  return `${baseUrl}/${slug}`;
};

/**
 * Increment the link click counter for a given link
 * @param linkId The ID of the link to increment
 */
export const incrementLinkClick = async (linkId: string): Promise<void> => {
  try {
    // Use RPC to insert link click
    const { error } = await supabase.rpc('insert_link_click', {
      link_id_param: linkId
    });
    
    if (error) {
      console.error('Error incrementing link click:', error);
    }
  } catch (error) {
    console.error('Error incrementing link click:', error);
  }
};

/**
 * Track a profile view
 * @param profileId The ID of the profile that was viewed
 * @param source The source of the view (e.g., 'direct', 'linkedin')
 */
export const trackProfileView = async (profileId: string, source: string = 'direct'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        source: source
      });

    if (error) {
      console.error('Error tracking profile view:', error);
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
  }
};
