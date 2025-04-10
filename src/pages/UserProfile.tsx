
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import { useProfileDesign } from '@/hooks/profile/useProfileDesign';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error } = useProfile(username);
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const { settings: designSettings, loading: designLoading } = useProfileDesign(profile?.id);
  
  // Check if this is a QR code scan or NFC tap
  useEffect(() => {
    const checkSource = async () => {
      try {
        if (profile?.id) {
          const urlParams = new URLSearchParams(location.search);
          const source = urlParams.get('source');
          
          if (source === 'qr') {
            console.log('QR code scan for profile:', profile.id);
            await trackProfileView(profile.id, 'qr');
            
            // Remove source param from URL without refreshing page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('source');
            navigate(newUrl.pathname + newUrl.search, { replace: true });
          } else if (source === 'nfc') {
            console.log('NFC tap for profile:', profile.id);
            await trackProfileView(profile.id, 'nfc');
            
            // Remove source param from URL without refreshing page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('source');
            navigate(newUrl.pathname + newUrl.search, { replace: true });
          } else {
            // Regular view tracking
            const urlParams = new URLSearchParams(location.search);
            const utmSource = urlParams.get('utm_source') || urlParams.get('source') || 'direct';
            await trackProfileView(profile.id, utmSource);
          }
        }
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    };
    
    if (profile) {
      checkSource();
    }
  }, [profile, location.search, navigate]);
  
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
    if (profile) {
      setRequiresLogin(profile.allow_network_saves || false);
    }
  }, [profile]);

  // Create a function to generate background style based on design settings
  const getBackgroundStyle = () => {
    if (!designSettings) {
      return {
        background: "var(--profile-bg, var(--profile-bg-color))",
        backgroundPosition: "var(--profile-bg-position, center)",
        backgroundSize: "var(--profile-bg-size, cover)",
        fontFamily: "var(--profile-font-family, Inter, sans-serif)",
        textAlign: "var(--profile-text-align, center)" as "left" | "center" | "right"
      };
    }

    let style: React.CSSProperties = {
      fontFamily: designSettings.font_family || "Inter, sans-serif",
      textAlign: designSettings.text_alignment as "left" | "center" | "right"
    };

    // Set background based on type
    if (designSettings.background_type === 'solid') {
      style.backgroundColor = designSettings.background_color;
    } else if (designSettings.background_type === 'gradient' && 
               designSettings.background_gradient_start && 
               designSettings.background_gradient_end) {
      style.background = `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`;
      console.log('Applied gradient to profile page:', style.background);
    } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
      style.backgroundImage = `url(${designSettings.background_image_url})`;
      style.backgroundPosition = 'center';
      style.backgroundSize = 'cover';
    }

    return style;
  };
  
  if (loading || sectionsLoading || designLoading) {
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
  
  const headerTextColor = designSettings?.name_color || 'inherit';
  const bioTextColor = designSettings?.description_color || '';
  
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
        style={getBackgroundStyle()}
      >
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
      </div>
    </>
  );
};

export default UserProfile;
