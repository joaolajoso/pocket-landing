import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xhcqhmbhivxbwnoifcoc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getProfileViewStats = async (profileId: string) => {
  try {
    // Since profile_views_stats table doesn't exist yet, let's return mock data
    // that matches the expected schema until the table is created
    
    // Check if the profile_views table exists
    const { count, error: countError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);
    
    if (countError) {
      console.error('Error checking profile views:', countError);
      return { total: 0, lastWeek: 0, lastMonth: 0, daily: [] };
    }
    
    // Calculate dates for filtering
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setDate(now.getDate() - 30);
    
    // Get count of views in the past week
    const { count: weekCount, error: weekError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('timestamp', oneWeekAgo.toISOString());
    
    if (weekError) {
      console.error('Error counting weekly profile views:', weekError);
    }
    
    // Get count of views in the past month
    const { count: monthCount, error: monthError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('timestamp', oneMonthAgo.toISOString());
    
    if (monthError) {
      console.error('Error counting monthly profile views:', monthError);
    }
    
    // Get daily view counts for the past 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const { count: dayCount, error: dayError } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .gte('timestamp', date.toISOString())
        .lt('timestamp', nextDate.toISOString());
      
      if (dayError) {
        console.error(`Error counting views for ${date.toISOString()}:`, dayError);
      }
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        count: dayCount || 0
      });
    }
    
    return {
      total: count || 0,
      lastWeek: weekCount || 0,
      lastMonth: monthCount || 0,
      daily: dailyData
    };
  } catch (error) {
    console.error('Error fetching profile views:', error);
    return { total: 0, lastWeek: 0, lastMonth: 0, daily: [] };
  }
};

/**
 * Generate standardized profile URL
 * @param slug Username/slug of the profile
 * @returns Fully qualified URL to the user's profile
 */
export const getProfileUrl = (slug: string) => {
  // Always use pocketcv.pt domain for production URLs
  return `https://pocketcv.pt/u/${slug}`;
};

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
