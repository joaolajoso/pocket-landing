
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "./types";

export const useProfileFormLogic = (userData: {
  name: string;
  bio: string;
  username: string;
  avatarUrl: string;
}, onClose?: () => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadProfilePhoto, deleteProfilePhoto, refreshProfile } = useProfile();
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: profile?.name || userData.name,
      bio: profile?.bio || userData.bio,
      username: profile?.slug || userData.username,
      headline: profile?.headline || "",
      linkedin: profile?.linkedin || "",
      website: profile?.website || "",
      phone_number: profile?.phone_number || "",
      share_email_publicly: profile?.share_email_publicly ?? true,
      share_phone_publicly: profile?.share_phone_publicly ?? true
    }
  });
  
  useEffect(() => {
    if (profile) {
      console.log("Updating form with profile data:", profile);
      form.reset({
        name: profile.name || userData.name,
        bio: profile.bio || userData.bio,
        username: profile.slug || userData.username,
        headline: profile.headline || "",
        linkedin: profile.linkedin || "",
        website: profile.website || "",
        phone_number: profile.phone_number || "",
        share_email_publicly: profile.share_email_publicly ?? true,
        share_phone_publicly: profile.share_phone_publicly ?? true
      });
    }
  }, [profile, userData, form]);
  
  const generateSlugFromName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  
  const handleNameChange = (name: string) => {
    const currentUsername = form.getValues("username");
    
    if (!currentUsername) {
      const suggestedUsername = generateSlugFromName(name);
      form.setValue("username", suggestedUsername);
    }
  };
  
  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    try {
      const photoUrl = await uploadProfilePhoto(file);
      
      if (photoUrl) {
        refreshProfile();
      }
      
      return photoUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handlePhotoDelete = async (): Promise<boolean> => {
    try {
      const success = await deleteProfilePhoto();
      
      if (success) {
        refreshProfile();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting your profile picture",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      console.log("Submitting form with values:", values);
      
      let username = values.username;
      if (!username && values.name) {
        username = generateSlugFromName(values.name);
      }
      
      // Make sure to pass all form values to updateProfile
      const success = await updateProfile({
        name: values.name,
        bio: values.bio,
        slug: username,
        headline: values.headline,
        linkedin: values.linkedin,
        website: values.website,
        phone_number: values.phone_number,
        share_email_publicly: values.share_email_publicly,
        share_phone_publicly: values.share_phone_publicly
      });
      
      if (success) {
        toast({
          title: "Profile updated successfully",
          description: "Your changes have been saved"
        });
        
        refreshProfile();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem saving your changes",
        variant: "destructive"
      });
    }
  };

  const displayName = profile?.name || userData.name;
  const photoUrl = profile?.photo_url || userData.avatarUrl;

  return {
    form,
    loading,
    user,
    onSubmit,
    handleNameChange,
    handlePhotoUpload,
    handlePhotoDelete,
    displayName,
    photoUrl
  };
};
