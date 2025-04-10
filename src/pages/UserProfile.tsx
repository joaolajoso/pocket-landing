
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileThemeManager from '@/components/profile/ProfileThemeManager';
import SaveProfileButton from '@/components/profile/SaveProfileButton';
import { useProfile } from '@/hooks/useProfile';
import { useProfileDesign } from '@/hooks/profile/useProfileDesign';
import { useProfileViewTracking } from '@/hooks/profile/useProfileViewTracking';
import { useProfileSections } from '@/hooks/profile/useProfileSections';
import ProfileBackground from '@/components/profile/ProfileBackground';
import ProfileLoadingStates from '@/components/profile/ProfileLoadingStates';
import ProfileSEO from '@/components/profile/ProfileSEO';

interface ProfileTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading, error } = useProfile(username);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const { settings: designSettings, loading: designLoading } = useProfileDesign(profile?.id);
  
  // Track profile views
  useProfileViewTracking(profile?.id);
  
  // Generate profile sections
  const { sections, loading: sectionsLoading } = useProfileSections(profile);
  
  // Set login requirement based on profile settings
  useEffect(() => {
    if (profile) {
      setRequiresLogin(profile.allow_network_saves || false);
    }
  }, [profile]);
  
  // Show loading or error states
  const loadingComponent = (
    <ProfileLoadingStates 
      loading={loading || sectionsLoading || designLoading} 
      error={error} 
      profile={profile} 
    />
  );
  
  if (loading || sectionsLoading || designLoading || error || !profile) {
    return loadingComponent;
  }
  
  const theme: ProfileTheme = {
    primaryColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
    fontFamily: "Inter, sans-serif",
  };
  
  const headerTextColor = designSettings?.name_color || 'inherit';
  const bioTextColor = designSettings?.description_color || '';
  
  return (
    <>
      <ProfileSEO 
        name={profile.name || 'User'} 
        bio={profile.bio || ''} 
        photoUrl={profile.photo_url}
      />
      
      <ProfileBackground designSettings={designSettings}>
        <ProfileThemeManager theme={theme} profileId={profile.id} />
        
        <div className="max-w-md mx-auto">
          <ProfileHeader 
            name={profile.name || 'User'} 
            bio={profile.bio || ''} 
            headline={profile.headline || profile.job_title || ''}
            avatarUrl={profile.photo_url || profile.avatar_url || ''} 
            nameColor={headerTextColor}
            bioColor={bioTextColor}
          />
          
          {profile.id && (
            <div className="flex justify-center mb-6">
              <SaveProfileButton 
                profileId={profile.id} 
                requiresLogin={requiresLogin}
              />
            </div>
          )}
          
          <ProfileContent 
            sections={sections} 
            username={profile.slug || ''} 
            profileId={profile.id}
            designSettings={designSettings}
          />
        </div>
      </ProfileBackground>
    </>
  );
};

export default UserProfile;
