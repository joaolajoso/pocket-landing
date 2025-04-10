
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
    if (!user) {
      console.error('Cannot upload profile photo: User not authenticated');
      toast({
        title: "Authentication required",
        description: "You need to be logged in to upload a profile photo",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setLoading(true);
      console.log('Starting profile photo upload for user:', user.id);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to path:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading profile photo:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData?.path);
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);
      
      if (!data.publicUrl) {
        console.error('Could not get public URL for uploaded file');
        throw new Error("Could not get public URL");
      }
      
      console.log('Got public URL:', data.publicUrl);
      
      // Update profile with new photo URL
      const success = await updateProfile({ 
        photo_url: data.publicUrl
      });
      
      if (!success) {
        console.error('Failed to update profile with new photo URL');
        throw new Error("Failed to update profile with new photo URL");
      }
      
      console.log('Profile updated with new photo URL');
      
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully",
      });
      
      return data.publicUrl;
      
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      toast({
        title: "Error uploading photo",
        description: err.message || "There was a problem uploading your photo",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete profile photo
  const deleteProfilePhoto = async (): Promise<boolean> => {
    if (!user) {
      console.error('Cannot delete profile photo: User not authenticated');
      toast({
        title: "Authentication required",
        description: "You need to be logged in to delete your profile photo",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log('Starting profile photo deletion for user:', user.id);
      
      // First check if user has a photo URL
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('photo_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }
      
      if (!profileData.photo_url) {
        console.log('No photo to delete');
        toast({
          title: "No photo to delete",
          description: "You don't have a profile photo to delete",
        });
        return false;
      }
      
      // Extract file path from URL
      const fileUrl = profileData.photo_url;
      console.log('Extracting file path from URL:', fileUrl);
      const pathMatch = fileUrl.match(/\/([^/]+\/[^/]+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        console.log('Extracted file path:', filePath);
        
        // Delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('profile_photos')
          .remove([filePath]);
        
        if (deleteError) {
          console.error('Error deleting file from storage:', deleteError);
          throw deleteError;
        }
        
        console.log('File deleted from storage');
      } else {
        console.warn('Could not extract file path from URL:', fileUrl);
      }
      
      // Update profile to remove photo URL
      const success = await updateProfile({
        photo_url: null
      });
      
      if (!success) {
        console.error('Failed to update profile after photo deletion');
        throw new Error("Failed to update profile after photo deletion");
      }
      
      console.log('Profile updated to remove photo URL');
      
      toast({
        title: "Photo deleted",
        description: "Your profile photo has been removed",
      });
      
      return true;
      
    } catch (err: any) {
      console.error('Error deleting profile photo:', err);
      toast({
        title: "Error deleting photo",
        description: err.message || "There was a problem deleting your profile photo",
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
