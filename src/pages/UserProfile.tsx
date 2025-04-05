
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileThemeManager from '@/components/profile/ProfileThemeManager';
import { fetchProfile, fetchProfileSections, fetchSectionLinks, incrementProfileView, type Profile, type Section, type Link as DbLink } from '@/lib/supabase';

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

interface UserProfileData {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  sections: ProfileSection[];
  theme: ProfileTheme;
}

interface ProfileTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!username) {
          setError("Profile not found");
          setLoading(false);
          return;
        }
        
        // Fetch the profile data from Supabase
        const profileData = await fetchProfile(username);
        
        if (!profileData) {
          setError("Profile not found");
          setLoading(false);
          return;
        }
        
        // Increment the profile view counter
        await incrementProfileView(profileData.id);
        
        // Fetch the profile sections
        const sectionsData = await fetchProfileSections(profileData.id);
        
        // Fetch the links for each section
        const sectionsWithLinks: ProfileSection[] = await Promise.all(
          sectionsData.map(async (section: Section) => {
            const linksData = await fetchSectionLinks(section.id);
            
            // Transform the links to match the expected format
            const links: LinkType[] = linksData.map((link: DbLink) => ({
              id: link.id,
              title: link.title,
              url: link.url,
              icon: link.icon || null,
            }));
            
            return {
              id: section.id,
              title: section.title,
              links,
            };
          })
        );
        
        // Create the profile data in the expected format
        const userData: UserProfileData = {
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio || "",
          avatarUrl: profileData.avatar_url || "",
          sections: sectionsWithLinks,
          theme: {
            primaryColor: profileData.primary_color || "#0ea5e9",
            backgroundColor: profileData.background_color || "#f0f9ff",
            fontFamily: profileData.font_family || "Inter, sans-serif",
          },
        };
        
        setProfile(userData);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [username]);
  
  if (loading) {
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
  
  return (
    <div 
      className="min-h-screen py-6 px-4 md:py-12 profile-page" 
      style={{ 
        backgroundColor: profile.theme.backgroundColor,
        fontFamily: profile.theme.fontFamily
      }}
    >
      <ProfileThemeManager theme={profile.theme} />
      
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <ProfileHeader 
          name={profile.name} 
          bio={profile.bio} 
          avatarUrl={profile.avatarUrl} 
        />
        
        {/* Profile Content */}
        <ProfileContent 
          sections={profile.sections} 
          username={profile.username} 
        />
      </div>
    </div>
  );
};

export default UserProfile;
