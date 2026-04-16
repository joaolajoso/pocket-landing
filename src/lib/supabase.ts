import { supabase } from '@/integrations/supabase/client';

// ============= Visitor Tracking Utilities =============

/**
 * Get or create a persistent visitor ID for this device/browser
 */
const getVisitorId = (): string => {
  const VISITOR_KEY = 'pocketcv_visitor_id';
  let visitorId = localStorage.getItem(VISITOR_KEY);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  
  return visitorId;
};

/**
 * Get the localStorage key for tracking views
 */
const getViewKey = (profileId: string): string => {
  const visitorId = getVisitorId();
  return `pocketcv_view_${profileId}_${visitorId}`;
};

/**
 * Get the localStorage key for tracking link clicks
 */
const getClickKey = (linkId: string, profileOwnerId: string): string => {
  const visitorId = getVisitorId();
  return `pocketcv_click_${linkId}_${profileOwnerId}_${visitorId}`;
};

/**
 * Cleanup old view/click entries from localStorage (older than 7 days)
 */
const cleanupOldTrackingKeys = (): void => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('pocketcv_view_') || key.startsWith('pocketcv_click_'))) {
        const dateStr = localStorage.getItem(key);
        if (dateStr && dateStr < sevenDaysAgoStr) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('[Cleanup] Error cleaning old tracking keys:', error);
  }
};

// Run cleanup on module load (once per session)
if (typeof window !== 'undefined') {
  cleanupOldTrackingKeys();
}

// ============= Profile View Stats =============

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

// ============= Link Click Tracking =============

export const incrementLinkClick = async (
  linkId: string, 
  profileOwnerId: string,
  currentUserId?: string
): Promise<void> => {
  try {
    // SYNC CHECK: Don't track clicks from the profile owner
    if (currentUserId && currentUserId === profileOwnerId) {
      console.log('[LinkClick] Skipping - owner clicking own link');
      return;
    }

    // Check if this device already clicked today (persistent across sessions)
    const clickKey = getClickKey(linkId, profileOwnerId);
    const lastClick = localStorage.getItem(clickKey);
    const today = new Date().toISOString().split('T')[0];
    
    if (lastClick === today) {
      console.log('[LinkClick] Skipping - already clicked today from this device');
      return;
    }

    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileOwnerId,
        source: `click:${linkId}`
      });
    
    if (!error) {
      localStorage.setItem(clickKey, today);
      console.log('[LinkClick] Tracked successfully');
    } else {
      console.error('[LinkClick] Error:', error);
    }
  } catch (error) {
    console.error('[LinkClick] Error:', error);
  }
};

// ============= Profile View Tracking =============

/**
 * Track a profile view with robust deduplication
 * @param profileId - The profile being viewed
 * @param source - Source of the view (direct, qr, nfc, etc.)
 * @param currentUserId - The current authenticated user's ID (passed from context)
 */
export const trackProfileView = async (
  profileId: string, 
  source: string = 'direct',
  currentUserId?: string
): Promise<void> => {
  try {
    // SYNC CHECK 1: Don't track views from the profile owner (using passed user ID)
    if (currentUserId && currentUserId === profileId) {
      console.log('[TrackView] Skipping - owner viewing own profile (sync check)');
      return;
    }

    // Check if this device already viewed today (persistent across sessions)
    const viewKey = getViewKey(profileId);
    const lastView = localStorage.getItem(viewKey);
    const today = new Date().toISOString().split('T')[0];
    
    if (lastView === today) {
      console.log('[TrackView] Skipping - already viewed today from this device');
      return;
    }

    // Insert the view
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        source: source
      });

    if (!error) {
      localStorage.setItem(viewKey, today);
      console.log('[TrackView] View tracked successfully for profile:', profileId);
    } else {
      console.error('[TrackView] Error:', error);
    }
  } catch (error) {
    console.error('[TrackView] Error:', error);
  }
};

/**
 * Track access to a profile via NFC tap
 */
export const trackNfcTap = async (profileId: string, currentUserId?: string): Promise<void> => {
  return trackProfileView(profileId, 'nfc', currentUserId);
};

/**
 * Track access to a profile via QR code scan
 */
export const trackQrScan = async (profileId: string, currentUserId?: string): Promise<void> => {
  return trackProfileView(profileId, 'qr', currentUserId);
};
