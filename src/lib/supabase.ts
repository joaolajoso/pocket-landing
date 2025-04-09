import { supabase } from '@/integrations/supabase/client';

// Type definitions for our database tables
export type Profile = {
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
  job_title: string | null;
  full_name: string | null;
  avatar_url: string | null;
  allow_network_saves?: boolean;
};

// Type for link click tracking
export type LinkClick = {
  id: string;
  link_id: string;
  user_id: string;
  created_at: string;
};

// Type for profile view tracking
export type ProfileView = {
  id: string;
  profile_id: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  source: string | null;
};

// Initialize storage bucket for profile photos
export const initializeStorage = async () => {
  try {
    // Check if profile_photos bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const profileBucketExists = buckets?.some(bucket => bucket.name === 'profile_photos');
    
    if (!profileBucketExists) {
      // Create the bucket
      await supabase.storage.createBucket('profile_photos', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB limit
      });
      
      console.log('Created profile_photos storage bucket');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Call initializeStorage once when the app loads
initializeStorage();

// Database helper functions
export async function fetchProfile(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', username)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
}

export async function fetchCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(profileId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
}

export async function uploadProfileImage(userId: string, file: File): Promise<string | null> {
  // Create a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  // Upload the file
  const { error } = await supabase.storage
    .from('profile_photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }
  
  // Get the public URL
  const { data } = supabase.storage
    .from('profile_photos')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}

// Function to track profile view
export async function trackProfileView(profileId: string, source?: string): Promise<boolean> {
  try {
    // Get basic browser info
    const userAgent = navigator.userAgent;
    
    // Insert the view record
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        user_agent: userAgent,
        source: source || 'direct'
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error tracking profile view:', error);
    return false;
  }
}

// Function to get profile view stats
export async function getProfileViewStats(profileId: string): Promise<{
  total: number;
  lastWeek: number;
  lastMonth: number;
  daily: { date: string; count: number; }[];
}> {
  try {
    // Get total views
    const { count: total, error: totalError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);
    
    if (totalError) throw totalError;
    
    // Get views from last week
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    
    const { count: lastWeek, error: weekError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('timestamp', lastWeekDate.toISOString());
    
    if (weekError) throw weekError;
    
    // Get views from last month
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const { count: lastMonth, error: monthError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('timestamp', lastMonthDate.toISOString());
    
    if (monthError) throw monthError;
    
    // Get daily breakdown for the last week
    const { data: dailyData, error: dailyError } = await supabase
      .from('profile_views')
      .select('timestamp')
      .eq('profile_id', profileId)
      .gte('timestamp', lastWeekDate.toISOString());
    
    if (dailyError) throw dailyError;
    
    // Process daily data
    const dailyCounts: Record<string, number> = {};
    const today = new Date();
    
    // Initialize the last 7 days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyCounts[dateString] = 0;
    }
    
    // Count views by day
    if (dailyData) {
      dailyData.forEach(view => {
        const dateString = new Date(view.timestamp).toISOString().split('T')[0];
        if (dailyCounts[dateString] !== undefined) {
          dailyCounts[dateString]++;
        }
      });
    }
    
    // Convert to array format for charts
    const daily = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    }));
    
    return {
      total: total || 0,
      lastWeek: lastWeek || 0,
      lastMonth: lastMonth || 0,
      daily
    };
    
  } catch (error) {
    console.error('Error fetching profile view stats:', error);
    return {
      total: 0,
      lastWeek: 0,
      lastMonth: 0,
      daily: []
    };
  }
}

// Function to increment link click count - modified to handle userId correctly
export async function incrementLinkClick(linkId: string, userId?: string): Promise<boolean> {
  try {
    // Get current user if userId is not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found when trying to increment link click');
        return false;
      }
      userId = user.id;
    }

    // Use a more generic approach with SQL instead of the typed client to avoid TypeScript errors
    const { data, error } = await supabase.rpc('insert_link_click', {
      link_id_param: linkId,
      user_id_param: userId
    });
    
    if (error) {
      console.error('Error tracking link click:', error);
      
      // Fallback method if the function doesn't exist
      const { error: insertError } = await supabase.from('link_clicks' as any)
        .insert({ 
          link_id: linkId,
          user_id: userId
        });
        
      if (insertError) {
        console.error('Error in fallback method for link click:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking link click:', error);
    return false;
  }
}
