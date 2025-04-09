
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
