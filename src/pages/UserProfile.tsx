import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileThemeManager from '@/components/profile/ProfileThemeManager';
import SaveProfileButton from '@/components/profile/SaveProfileButton';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { trackProfileView } from '@/lib/supabase';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSection {
  id: string;
  title: string;
  links: LinkType[];
}

interface LinkType {
  id: string;
  title: string;
  url: string;
  icon: string | null;
}

interface ProfileTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading, error } = useProfile(username);
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  
  useEffect(() => {
    const trackView = async () => {
      try {
        if (profile?.id) {
          console.log('Tracking view for profile:', profile.id);
          const urlParams = new URLSearchParams(location.search);
          const source = urlParams.get('utm_source') || urlParams.get('source') || 'direct';
          await trackProfileView(profile.id, source);
        }
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    };
    
    if (profile) {
      trackView();
    }
  }, [profile, location.search]);
  
  useEffect(() => {
    if (profile) {
      const contactLinks = [];
      
      if (profile.email) {
        contactLinks.push({
          id: 'email-link',
          title: 'Email',
          url: `mailto:${profile.email}`,
          icon: null
        });
      }
      
      if (profile.linkedin) {
        contactLinks.push({
          id: 'linkedin-link',
          title: 'LinkedIn',
          url: profile.linkedin.startsWith('http') 
            ? profile.linkedin 
            : `https://linkedin.com/in/${profile.linkedin}`,
          icon: null
        });
      }
      
      if (profile.website) {
        contactLinks.push({
          id: 'website-link',
          title: 'Website',
          url: profile.website.startsWith('http') 
            ? profile.website 
            : `https://${profile.website}`,
          icon: null
        });
      }
      
      const sections = [];
      
      if (contactLinks.length > 0) {
        sections.push({
          id: 'contact-section',
          title: 'Contact Information',
          links: contactLinks
        });
      }
      
      setSections(sections);
      setSectionsLoading(false);
    }
  }, [profile]);
  
  useEffect(() => {
    if (profile && !user) {
      setRequiresLogin(true);
    } else {
      setRequiresLogin(false);
    }
  }, [profile, user]);
  
  if (loading || sectionsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested profile does not exist.</p>
      </div>
    );
  }
  
  const theme: ProfileTheme = {
    primaryColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
    fontFamily: "Inter, sans-serif",
  };
  
  return (
    <>
      <Helmet>
        <title>{profile.name || 'Profile'} | PocketCV</title>
        <meta name="description" content={profile.bio || `${profile.name}'s online resume and contact information`} />
        <meta property="og:title" content={`${profile.name} | PocketCV`} />
        <meta property="og:description" content={profile.bio || `${profile.name}'s online resume and contact information`} />
        {profile.photo_url && <meta property="og:image" content={profile.photo_url} />}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      
      <div 
        className="min-h-screen py-8 px-4"
        style={{
          background: "var(--profile-bg, var(--profile-bg-color))",
          backgroundPosition: "var(--profile-bg-position, center)",
          backgroundSize: "var(--profile-bg-size, cover)",
          fontFamily: "var(--profile-font-family, Inter, sans-serif)",
          textAlign: "var(--profile-text-align, center)" as "left" | "center" | "right"
        }}
      >
        <ProfileThemeManager theme={theme} profileId={profile.id} />
        
        <div className="max-w-md mx-auto">
          <ProfileHeader 
            name={profile.name || 'User'} 
            bio={profile.bio || ''} 
            headline={profile.headline || profile.job_title || ''}
            avatarUrl={profile.photo_url || profile.avatar_url || ''} 
          />
          
          {profile.id && profile.id !== user?.id && (
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
          />
        </div>
      </div>
    </>
  );
};

export default UserProfile;
