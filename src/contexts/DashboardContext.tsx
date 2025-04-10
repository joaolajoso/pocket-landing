
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LinkType } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Linkedin, Globe, Mail, User } from "lucide-react";

// Define the shape of our context
interface DashboardContextType {
  links: LinkType[];
  userData: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLinkEditorOpen: boolean;
  openLinkEditor: (linkId?: string) => void;
  closeLinkEditor: () => void;
  currentEditingLink: LinkType | undefined;
  saveLink: (linkData: Omit<LinkType, "id"> & { id?: string }) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
  refreshData: () => void;
  profileLoading: boolean;
}

// Create the context with a default value
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export function DashboardProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  
  // State
  const [links, setLinks] = useState<LinkType[]>([]);
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    bio: "",
    email: "",
    avatarUrl: "",
    username: "",
    profileViews: 0,
    totalClicks: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<LinkType | undefined>(undefined);

  // Update user data when profile is loaded
  useEffect(() => {
    if (profile && user) {
      setUserData({
        id: user.id || "",
        name: profile.name || "",
        bio: profile.bio || "",
        email: profile.email || user.email || "",
        avatarUrl: profile.photo_url || "",
        username: profile.slug || "",
        profileViews: 0,
        totalClicks: 0,
      });
    }
  }, [profile, user]);
  
  // Fetch links from profile data
  useEffect(() => {
    if (profile) {
      const profileLinks: LinkType[] = [];
      
      if (profile.linkedin) {
        profileLinks.push({
          id: "linkedin-link",
          title: "LinkedIn Profile",
          url: profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`,
          icon: <Linkedin className="h-4 w-4" />,
        });
      }
      
      if (profile.website) {
        profileLinks.push({
          id: "website-link",
          title: "Website",
          url: profile.website.startsWith('http') ? profile.website : `https://${profile.website}`,
          icon: <Globe className="h-4 w-4" />,
        });
      }
      
      if (profile.email) {
        profileLinks.push({
          id: "email-link",
          title: "Email",
          url: `mailto:${profile.email}`,
          icon: <Mail className="h-4 w-4" />,
        });
      }
      
      setLinks(profileLinks);
    }
  }, [profile]);

  // Link Editor Functions
  const openLinkEditor = (linkId?: string) => {
    if (linkId) {
      const linkToEdit = links.find(link => link.id === linkId);
      setCurrentEditingLink(linkToEdit);
    } else {
      setCurrentEditingLink(undefined);
    }
    setIsLinkEditorOpen(true);
  };

  const closeLinkEditor = () => {
    setIsLinkEditorOpen(false);
    setCurrentEditingLink(undefined);
  };

  // Link Management Functions
  const saveLink = async (linkData: Omit<LinkType, "id"> & { id?: string }) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to save links",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Determine field to update based on link type
      let fieldToUpdate: string | null = null;
      let linkType = "";
      
      // If it's an existing link, use its ID to determine the type
      if (linkData.id) {
        linkType = linkData.id.split('-')[0];
        if (linkType === 'linkedin') fieldToUpdate = 'linkedin';
        else if (linkType === 'website') fieldToUpdate = 'website';
        else if (linkType === 'email') fieldToUpdate = 'email';
      } else {
        // For new links, use the title to determine the type
        const title = linkData.title.toLowerCase();
        
        if (title.includes('linkedin')) {
          fieldToUpdate = 'linkedin';
          linkType = 'linkedin';
        } else if (title.includes('website') || title.includes('portfolio')) {
          fieldToUpdate = 'website';
          linkType = 'website';
        } else if (title.includes('email')) {
          fieldToUpdate = 'email';
          linkType = 'email';
        }
        
        // If no specific type is detected, default to website
        if (!fieldToUpdate) {
          fieldToUpdate = 'website';
          linkType = 'website';
        }
      }
      
      // Process URL for LinkedIn and website links
      let url = linkData.url;
      if (fieldToUpdate === 'linkedin' && !url.startsWith('http')) {
        url = `https://linkedin.com/in/${url}`;
      } else if (fieldToUpdate === 'website' && !url.startsWith('http')) {
        url = `https://${url}`;
      }
      
      console.log(`Saving link type: ${linkType}, field: ${fieldToUpdate}, url: ${url}`);
      
      if (fieldToUpdate) {
        // Update profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ [fieldToUpdate]: url })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
        
        // Create or update link in state
        const newLinkId = linkData.id || `${linkType}-link`;
        const newLink = {
          ...linkData,
          id: newLinkId,
          url: url,
          icon: getIconForLinkType(fieldToUpdate)
        } as LinkType;
        
        setLinks(prevLinks => {
          // Check if link exists
          const existingLinkIndex = prevLinks.findIndex(link => link.id === newLinkId);
          
          if (existingLinkIndex >= 0) {
            // Replace existing link
            const updatedLinks = [...prevLinks];
            updatedLinks[existingLinkIndex] = newLink;
            return updatedLinks;
          } else {
            // Add new link
            return [...prevLinks, newLink];
          }
        });
        
        toast({
          title: linkData.id ? "Link updated" : "Link added",
          description: `Your ${linkData.title} has been saved to your profile.`,
        });
        
        // Refresh profile to get updated links
        refreshProfile();
      } else {
        // Should not happen with our improved logic, but just in case
        toast({
          title: "Error saving link",
          description: "Could not determine link type. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving link:', error);
      toast({
        title: "Error saving link",
        description: "There was a problem saving your link",
        variant: "destructive",
      });
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!user) return;
    
    try {
      const linkToDelete = links.find(link => link.id === linkId);
      if (!linkToDelete) return;
      
      // Determine field to update based on link id
      let fieldToUpdate: string | null = null;
      
      if (linkId === 'linkedin-link') fieldToUpdate = 'linkedin';
      else if (linkId === 'website-link') fieldToUpdate = 'website';
      else if (linkId === 'email-link') fieldToUpdate = 'email';
      
      if (fieldToUpdate) {
        // Set field to null in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ [fieldToUpdate]: null })
          .eq('id', user.id);
          
        if (error) throw error;
        
        // Remove link from state
        setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
        
        toast({
          title: "Link deleted",
          description: "Your link has been removed",
        });
        
        // Refresh profile data
        refreshProfile();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Error deleting link",
        description: "There was a problem removing your link",
        variant: "destructive",
      });
    }
  };

  const getIconForLinkType = (type: string) => {
    if (type === 'linkedin') return <Linkedin className="h-4 w-4" />;
    if (type === 'website') return <Globe className="h-4 w-4" />;
    if (type === 'email') return <Mail className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const refreshData = () => {
    refreshProfile();
  };

  // Provide the context value
  const contextValue = {
    links,
    userData,
    activeTab,
    setActiveTab,
    isLinkEditorOpen,
    openLinkEditor,
    closeLinkEditor,
    currentEditingLink,
    saveLink,
    deleteLink,
    refreshData,
    profileLoading
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
