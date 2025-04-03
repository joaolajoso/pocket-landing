
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import ProfileSectionDisplay from '@/components/profile/ProfileSectionDisplay';
import ProfileFooter from '@/components/profile/ProfileFooter';
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
  
  // Helper function to convert hex color to HSL format for CSS variables
  const getHslFromHex = (hex: string): string => {
    // This is a simplified conversion - in a real app, you'd use a more accurate conversion
    const colorMap: Record<string, string> = {
      "#8b5cf6": "262.1 83.3% 57.8%", // Purple
      "#3b82f6": "217.2 91.2% 59.8%", // Blue
      "#22c55e": "142.1 70.6% 45.3%", // Green
      "#eab308": "47.9 95.8% 53.1%", // Yellow
      "#ef4444": "0 84.2% 60.2%", // Red
      "#0ea5e9": "199.2 89.7% 48.4%", // Sky Blue
      "#faf5ff": "270 100% 97.6%", // Light Purple
      "#eff6ff": "213.8 100% 96.9%", // Light Blue
      "#f0fdf4": "142.1 76.2% 97.3%", // Light Green
      "#fefce8": "48 100% 96.1%", // Light Yellow
      "#fef2f2": "0 85.7% 97.3%", // Light Red
      "#f0f9ff": "204 100% 97.1%", // Light Sky Blue
    };
    
    return colorMap[hex] || "262.1 83.3% 57.8%"; // Default to purple if not found
  };
  
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
        
        // Convert hex colors to HSL format for CSS variables
        const primaryColorHsl = getHslFromHex(userData.theme.primaryColor);
        const backgroundColorHsl = getHslFromHex(userData.theme.backgroundColor);
        
        // Set theme based on user preferences
        document.documentElement.style.setProperty('--profile-primary-color', primaryColorHsl);
        document.documentElement.style.setProperty('--profile-bg-color', backgroundColorHsl);
        
        // Add custom font if needed
        if (userData.theme.fontFamily && userData.theme.fontFamily !== "Inter, sans-serif") {
          const fontLink = document.createElement('link');
          fontLink.rel = 'stylesheet';
          fontLink.setAttribute('data-pocketcv-font', 'true');
          
          if (userData.theme.fontFamily.includes('Roboto')) {
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
          } else if (userData.theme.fontFamily.includes('Poppins')) {
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
          } else if (userData.theme.fontFamily.includes('Open Sans')) {
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap';
          }
          
          if (fontLink.href) {
            document.head.appendChild(fontLink);
          }
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
    
    // Clean up custom CSS variables when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--profile-primary-color');
      document.documentElement.style.removeProperty('--profile-bg-color');
      
      // Remove any added font links
      document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
        if (link.getAttribute('data-pocketcv-font')) {
          link.remove();
        }
      });
    };
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
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg mb-4">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="text-2xl">
              {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-3xl font-bold text-center">{profile.name}</h1>
          {profile.bio && (
            <p className="text-center text-xl mt-2 text-muted-foreground">{profile.bio}</p>
          )}
        </div>
        
        {/* Profile Sections */}
        <div className="space-y-8">
          {profile.sections.map(section => (
            <ProfileSectionDisplay key={section.id} section={section} />
          ))}
        </div>
        
        {/* Footer */}
        <ProfileFooter username={profile.username} />
      </div>
    </div>
  );
};

export default UserProfile;
