import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LeadCapturePopup from '@/components/profile/LeadCapturePopup';
import LeadCaptureFloatingButton from '@/components/profile/LeadCaptureFloatingButton';
import { useProfile } from '@/hooks/useProfile';
import { useProfileDesign } from '@/hooks/profile/useProfileDesign';
import { useProfileViewTracking } from '@/hooks/profile/useProfileViewTracking';
import { useProfileLinks } from '@/hooks/profile/useProfileLinks';
import ProfileLoadingStates from '@/components/profile/ProfileLoadingStates';
import ProfileSEO from '@/components/profile/ProfileSEO';
import NewPublicPage from '@/pages/NewPublicPage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { checkAndRecordStandVisit } from '@/hooks/useStandVisitMessenger';
import { Experience } from '@/hooks/useExperiences';
import { NetworkingPreferences } from '@/hooks/profile/useNetworkingPreferences';

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading, error } = useProfile(username);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const { settings: designSettings, loading: designLoading } = useProfileDesign(profile?.id);
  const { user } = useAuth();
  
  // State for new public page data
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [interests, setInterests] = useState<NetworkingPreferences | null>(null);
  const [viewerInterests, setViewerInterests] = useState<NetworkingPreferences | null>(null);
  
  useProfileViewTracking(profile?.id);

  // Auto-send stand visit message when viewing a stand's profile
  useEffect(() => {
    if (user && profile?.id && user.id !== profile.id) {
      checkAndRecordStandVisit(user.id, profile.id);
    }
  }, [user, profile?.id]);
  
  // Use unified hook for all links
  const { sections, socialLinks, ungroupedLinks, loading: linksLoading } = useProfileLinks(profile);

  // Fetch viewer's interests (current logged-in user)
  useEffect(() => {
    const fetchViewerInterests = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_interests')
        .select('professional_roles, industries, networking_goals')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setViewerInterests({
          professional_roles: data.professional_roles || [],
          industries: data.industries || [],
          networking_goals: data.networking_goals || []
        });
      }
    };

    fetchViewerInterests();
  }, [user]);

  // Fetch experiences and interests for the profile - PARALLELIZED
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profile?.id) return;

      // Execute all queries in parallel for better performance
      const [expResult, intResult] = await Promise.all([
        supabase
          .from('experiences')
          .select('*')
          .eq('user_id', profile.id)
          .order('position', { ascending: true }),
        supabase
          .from('user_interests')
          .select('professional_roles, industries, networking_goals')
          .eq('user_id', profile.id)
          .maybeSingle()
      ]);

      if (expResult.data) {
        setExperiences(expResult.data as Experience[]);
      }

      if (intResult.data) {
        setInterests({
          professional_roles: intResult.data.professional_roles || [],
          industries: intResult.data.industries || [],
          networking_goals: intResult.data.networking_goals || []
        });
      }
    };

    fetchProfileData();
  }, [profile?.id]);
  
  const isProfileOwner = user && profile && user.id === profile.id;
  const isLeadCaptureEnabled = profile?.lead_capture_enabled ?? true;
  
  useEffect(() => {
    if (!profile || !profile.id || isProfileOwner || !isLeadCaptureEnabled) {
      return;
    }

    const today = new Date().toDateString();
    const dismissalKey = `leadCapture-dismissed-${profile.id}-${today}`;
    const wasDismissedToday = localStorage.getItem(dismissalKey);
    
    if (wasDismissedToday) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLeadCapture(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [profile, isProfileOwner, isLeadCaptureEnabled]);

  const handleLeadCaptureClose = () => {
    if (profile?.id) {
      const today = new Date().toDateString();
      const dismissalKey = `leadCapture-dismissed-${profile.id}-${today}`;
      localStorage.setItem(dismissalKey, 'true');
    }
    setShowLeadCapture(false);
  };
  
  // Loading and error states
  if (loading || linksLoading || designLoading) {
    return (
      <ProfileLoadingStates 
        loading={true} 
        error={null} 
        profile={null} 
      />
    );
  }
  
  if (error || !profile) {
    return (
      <ProfileLoadingStates 
        loading={false} 
        error={error || 'Profile not found'} 
        profile={null} 
      />
    );
  }

  // Transform sections for NewPublicPage
  const sectionsForNewPage = sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    displayTitle: section.displayTitle ?? true,
    position: index,
    links: section.links.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      icon: link.icon
    }))
  }));

  return (
    <>
      {profile && (
        <ProfileSEO 
          name={profile.name || 'User'} 
          bio={profile.bio || ''} 
          photoUrl={profile.photo_url}
          username={profile.slug || username}
        />
      )}
      
      <div className="animate-fade-in">
        <NewPublicPage 
          profile={profile}
          sections={sectionsForNewPage}
          experiences={experiences}
          interests={interests}
          socialLinks={socialLinks}
          ungroupedLinks={ungroupedLinks}
          viewerInterests={viewerInterests}
          designSettings={designSettings}
        />
      </div>
      
      <AnimatePresence>
        {showLeadCapture && profile?.id && isLeadCaptureEnabled && !isProfileOwner && (
          <LeadCapturePopup
            profileOwnerId={profile.id}
            profileOwnerName={profile.name || 'Profile Owner'}
            profileOwnerEmail={profile.email}
            profileOwnerPhotoUrl={profile.photo_url}
            onClose={handleLeadCaptureClose}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!showLeadCapture && !isProfileOwner && profile?.id && isLeadCaptureEnabled && (
          <LeadCaptureFloatingButton
            onClick={() => setShowLeadCapture(true)}
            profileOwnerName={profile.name || 'Profile Owner'}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default UserProfile;
