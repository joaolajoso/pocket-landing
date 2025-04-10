
import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xhcqhmbhivxbwnoifcoc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getProfileViewStats = async (profileId: string) => {
  try {
    // Calculate dates for filtering
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setDate(now.getDate() - 30);
    
    // Get total count of views
    const { data: totalData, error: totalError } = await supabase.rpc(
      'get_profile_view_count',
      { user_id_param: profileId }
    );
    
    if (totalError) {
      console.error('Error counting total profile views:', totalError);
    }
    
    // Get count of views in the past week
    const { data: weekData, error: weekError } = await supabase.rpc(
      'get_weekly_profile_views',
      { user_id_param: profileId }
    );
    
    if (weekError) {
      console.error('Error counting weekly profile views:', weekError);
    }
    
    // Get count of views in the past month
    const { data: monthData, error: monthError } = await supabase.rpc(
      'get_monthly_profile_views',
      { user_id_param: profileId }
    );
    
    if (monthError) {
      console.error('Error counting monthly profile views:', monthError);
    }
    
    // Get daily view counts for the past 7 days
    const { data: dailyData, error: dailyError } = await supabase.rpc(
      'get_daily_profile_views',
      { user_id_param: profileId }
    );
    
    if (dailyError) {
      console.error('Error getting daily view data:', dailyError);
    }
    
    return {
      total: totalData || 0,
      lastWeek: weekData || 0,
      lastMonth: monthData || 0,
      daily: Array.isArray(dailyData) ? dailyData : []
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
  const baseUrl = window.location.hostname.includes('localhost') ? 
    `${window.location.origin}/u` : 
    'https://pocketcv.pt/u';
  
  return `${baseUrl}/${slug}`;
};

export const incrementLinkClick = async (linkId: string, userId: string): Promise<void> => {
  try {
    // Use RPC to insert link click
    const { error } = await supabase.rpc('insert_link_click', {
      link_id_param: linkId,
      user_id_param: userId
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

/**
 * Track access to a profile via NFC tap
 */
export const trackNfcTap = async (profileId: string): Promise<void> => {
  return trackProfileView(profileId, 'nfc');
};

/**
 * Track access to a profile via QR code scan
 */
export const trackQrScan = async (profileId: string): Promise<void> => {
  return trackProfileView(profileId, 'qr');
};
