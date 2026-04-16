
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
      
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully",
      });
      
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
  
  // Delete profile photo
  const deleteProfilePhoto = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // First check if user has a photo URL
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('photo_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (!profileData.photo_url) {
        toast({
          title: "No photo to delete",
          description: "You don't have a profile photo to delete",
        });
        return false;
      }
      
      // Extract file path from URL
      const fileUrl = profileData.photo_url;
      const pathMatch = fileUrl.match(/\/([^/]+\/[^/]+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        
        // Delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('profile_photos')
          .remove([filePath]);
        
        if (deleteError) throw deleteError;
      }
      
      // Update profile to remove photo URL
      const success = await updateProfile({
        photo_url: null
      });
      
      if (!success) throw new Error("Failed to update profile after photo deletion");
      
      toast({
        title: "Photo deleted",
        description: "Your profile photo has been removed",
      });
      
      return true;
      
    } catch (err: any) {
      console.error('Error deleting profile photo:', err);
      toast({
        title: "Error deleting photo",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadProfilePhoto,
    deleteProfilePhoto,
    loading
  };
};
