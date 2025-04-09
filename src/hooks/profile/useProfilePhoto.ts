
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProfileUpdate } from './useProfileUpdate';

export const useProfilePhoto = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateProfile } = useProfileUpdate();
  const [loading, setLoading] = useState(false);

  // Upload profile photo
  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);
      
      if (!data.publicUrl) throw new Error("Could not get public URL");
      
      // Update profile with new photo URL
      const success = await updateProfile({ 
        photo_url: data.publicUrl
      });
      
      if (!success) throw new Error("Failed to update profile with new photo URL");
      
      return data.publicUrl;
      
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      toast({
        title: "Error uploading photo",
        description: err.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadProfilePhoto,
    loading
  };
};
