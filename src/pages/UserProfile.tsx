
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileThemeManager from '@/components/profile/ProfileThemeManager';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

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
  const { profile, loading, error } = useProfile(username);
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  
  // Track profile view
  useEffect(() => {
    const trackView = async () => {
      try {
        if (profile?.id) {
          console.log('Tracking view for profile:', profile.id);
          // This is where you would implement view tracking when ready
        }
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    };
    
    if (profile) {
      trackView();
    }
  }, [profile]);
  
  // Fetch profile sections and links
  useEffect(() => {
    if (profile) {
      // Create contact section from profile data
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
          url: profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`,
          icon: null
        });
      }
      
      if (profile.website) {
        contactLinks.push({
          id: 'website-link',
          title: 'Website',
          url: profile.website.startsWith('http') ? profile.website : `https://${profile.website}`,
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
  
  // Default theme 
  const theme: ProfileTheme = {
    primaryColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
    fontFamily: "Inter, sans-serif",
  };
  
  return (
    <div 
      className="min-h-screen py-6 px-4 md:py-12 profile-page" 
      style={{ 
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily
      }}
    >
      <ProfileThemeManager theme={theme} />
      
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <ProfileHeader 
          name={profile.name || 'User'} 
          bio={profile.bio || ''} 
          avatarUrl={profile.photo_url || ''} 
        />
        
        {/* Profile Content */}
        <ProfileContent 
          sections={sections} 
          username={profile.slug || ''} 
        />
      </div>
    </div>
  );
};

export default UserProfile;
