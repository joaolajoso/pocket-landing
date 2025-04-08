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
  
  // Fetch profile sections and links (dummy data for now)
  useEffect(() => {
    if (profile) {
      // TODO: Replace with actual section data from Supabase
      // This is placeholder code until we implement sections table
      setSections([
        {
          id: '1',
          title: 'Contact Information',
          links: [
            {
              id: '1',
              title: 'Email',
              url: `mailto:${profile.email || ''}`,
              icon: null
            },
            {
              id: '2',
              title: 'LinkedIn',
              url: profile.linkedin || 'https://linkedin.com',
              icon: null
            },
            {
              id: '3',
              title: 'Website',
              url: profile.website || 'https://example.com',
              icon: null
            }
          ]
        }
      ]);
      setSectionsLoading(false);
    }
  }, [profile]);
  
  // Track profile view
  useEffect(() => {
    // TODO: Implement view tracking
    // This will be implemented in a future update
  }, [username]);
  
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
