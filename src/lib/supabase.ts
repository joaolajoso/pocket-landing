
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient>;

// Check if we have credentials before creating the client
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials missing. Using mock client with limited functionality.');
  
  // Create a mock client with dummy implementations
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          order: async () => ({ data: [], error: null }),
        }),
        order: async () => ({ data: [], error: null }),
      }),
      update: () => ({
        eq: async () => ({ error: null }),
      }),
    }),
    rpc: () => ({}),
  } as unknown as ReturnType<typeof createClient>;
}

export { supabase };

// Type definitions for our database tables
export type Profile = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  primary_color?: string;
  background_color?: string;
  font_family?: string;
  button_style?: string;
  created_at: string;
  updated_at: string;
  profile_views: number;
  total_clicks: number;
};

export type Section = {
  id: string;
  profile_id: string;
  title: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Link = {
  id: string;
  section_id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};

// Database helper functions
export async function fetchProfile(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function fetchProfileSections(profileId: string): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('profile_id', profileId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching sections:', error);
    return [];
  }

  return data || [];
}

export async function fetchSectionLinks(sectionId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('section_id', sectionId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching links:', error);
    return [];
  }

  return data || [];
}

export async function incrementProfileView(profileId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_views: supabase.rpc('increment', { row_id: profileId, table_name: 'profiles', column_name: 'profile_views' }) })
    .eq('id', profileId);

  if (error) {
    console.error('Error incrementing profile view:', error);
  }
}

export async function incrementLinkClick(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('links')
    .update({ clicks: supabase.rpc('increment', { row_id: linkId, table_name: 'links', column_name: 'clicks' }) })
    .eq('id', linkId);

  if (error) {
    console.error('Error incrementing link click:', error);
  }
}
