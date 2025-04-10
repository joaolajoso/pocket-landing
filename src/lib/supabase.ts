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
    const { count: totalCount, error: totalError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: false })
      .eq('profile_id', profileId);
    
    if (totalError) {
      console.error('Error counting total profile views:', totalError);
    }
    
    // Get count of views in the past week
    const { count: weekCount, error: weekError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: false })
      .eq('profile_id', profileId)
      .gte('timestamp', oneWeekAgo.toISOString());
    
    if (weekError) {
      console.error('Error counting weekly profile views:', weekError);
    }
    
    // Get count of views in the past month
    const { count: monthCount, error: monthError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: false })
      .eq('profile_id', profileId)
      .gte('timestamp', oneMonthAgo.toISOString());
    
    if (monthError) {
      console.error('Error counting monthly profile views:', monthError);
    }
    
    // Get daily view counts for the past 7 days
    const { data: dailyData, error: dailyError } = await supabase
      .from('profile_views')
      .select('timestamp')
      .eq('profile_id', profileId)
      .gte('timestamp', oneWeekAgo.toISOString())
      .order('timestamp', { ascending: true });
    
    if (dailyError) {
      console.error('Error getting daily view data:', dailyError);
    }
    
    // Process daily data into a format suitable for charts
    const dailyCounts = processDailyViewData(dailyData || []);
    
    return {
      total: totalCount || 0,
      lastWeek: weekCount || 0,
      lastMonth: monthCount || 0,
      daily: dailyCounts
    };
  } catch (error) {
    console.error('Error fetching profile views:', error);
    return { total: 0, lastWeek: 0, lastMonth: 0, daily: [] };
  }
};

// Helper function to process daily view data
const processDailyViewData = (viewsData: any[]) => {
  const dailyCounts: { date: string; count: number }[] = [];
  const countMap = new Map<string, number>();
  
  // Count views by day
  viewsData.forEach(view => {
    const date = new Date(view.timestamp).toISOString().split('T')[0];
    countMap.set(date, (countMap.get(date) || 0) + 1);
  });
  
  // Fill in missing days with zero counts
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    dailyCounts.unshift({
      date: dateStr,
      count: countMap.get(dateStr) || 0
    });
  }
  
  return dailyCounts;
};

/**
 * Generate standardized profile URL
 * @param slug Username/slug of the profile
 * @returns Fully qualified URL to the user's profile
 */
export const getProfileUrl = (slug: string) => {
  // Always use pocketcv.pt domain for all URLs
  return `https://pocketcv.pt/u/${slug}`;
};

export const incrementLinkClick = async (linkId: string, userId: string): Promise<void> => {
  try {
    // Instead of calling a DB function that doesn't exist, simply track link clicks
    // by inserting into profile_views table with a "click" source
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: userId,
        source: `click:${linkId}` // Store the link ID in the source field
      });
    
    if (error) {
      console.error('Error tracking link click:', error);
    }
  } catch (error) {
    console.error('Error tracking link click:', error);
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
