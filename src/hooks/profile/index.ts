
import { useState, useEffect } from 'react';
import { useProfileData, ProfileData } from './useProfileData';
import { useProfileUpdate } from './useProfileUpdate';
import { useProfilePhoto } from './useProfilePhoto';

export type { ProfileData } from './useProfileData';

export const useProfile = (slug?: string) => {
  const { profile, loading: dataLoading, error, refreshProfile } = useProfileData(slug);
  const { updateProfile, loading: updateLoading } = useProfileUpdate();
  const { uploadProfilePhoto, deleteProfilePhoto, loading: photoLoading } = useProfilePhoto();
  
  // Combine loading states
  const loading = dataLoading || updateLoading || photoLoading;

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    refreshProfile
  };
};
