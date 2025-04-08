
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
};

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

export async function updateProfile(profileId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
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
