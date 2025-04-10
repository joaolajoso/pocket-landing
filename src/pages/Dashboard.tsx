import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Linkedin, Globe, Mail, User } from "lucide-react";
import LinkEditor from "@/components/LinkEditor";
import Footer from "@/components/Footer";
import { LinkType } from "@/components/LinkCard";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Import refactored components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileNavigation from "@/components/dashboard/MobileNavigation";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import LinksTab from "@/components/dashboard/tabs/LinksTab";
import NetworkTab from "@/components/dashboard/tabs/NetworkTab";
import AppearanceTab from "@/components/dashboard/tabs/AppearanceTab";
import AnalyticsTab from "@/components/dashboard/tabs/AnalyticsTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import { Loader2 } from "lucide-react";

// Mock analytics data for AnalyticsTab
const mockAnalyticsData = {
  weeklyViews: [12, 15, 18, 24, 30, 28, 32],
  topLinks: [
    { name: "LinkedIn", clicks: 24 },
    { name: "Website", clicks: 18 },
    { name: "Email", clicks: 12 }
  ],
  referrers: [
    { name: "Direct", count: 45 },
    { name: "LinkedIn", count: 32 },
    { name: "Twitter", count: 18 },
    { name: "Google", count: 12 }
  ]
};

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  
  // User data from profile
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
        profileViews: 0, // This will be updated by StatisticsCards component
        totalClicks: 0,  // This will be updated by StatisticsCards component
      });
    }
  }, [profile, user]);
  
  // Store links
  const [links, setLinks] = useState<LinkType[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<LinkType | undefined>(undefined);
  
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

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOpenLinkEditor = (linkId?: string) => {
    if (linkId) {
      const linkToEdit = links.find(link => link.id === linkId);
      setCurrentEditingLink(linkToEdit);
    } else {
      setCurrentEditingLink(undefined);
    }
    setIsLinkEditorOpen(true);
  };

  const handleCloseLinkEditor = () => {
    setIsLinkEditorOpen(false);
    setCurrentEditingLink(undefined);
  };

  const handleSaveLink = async (linkData: Omit<LinkType, "id"> & { id?: string }) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to save links",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Determine field to update based on link type, not title
      let fieldToUpdate: string | null = null;
      const type = linkData.id?.split('-')[0] || linkData.title.toLowerCase();
      
      // If it's an existing link, use its ID to determine the type
      if (linkData.id) {
        if (linkData.id.startsWith('linkedin')) fieldToUpdate = 'linkedin';
        else if (linkData.id.startsWith('website')) fieldToUpdate = 'website';
        else if (linkData.id.startsWith('email')) fieldToUpdate = 'email';
      } else {
        // For new links, use the selected link type
        if (type.includes('linkedin')) fieldToUpdate = 'linkedin';
        else if (type.includes('website') || type.includes('portfolio')) fieldToUpdate = 'website';
        else if (type.includes('email')) fieldToUpdate = 'email';
      }
      
      if (fieldToUpdate) {
        const { error } = await supabase
          .from('profiles')
          .update({ [fieldToUpdate]: linkData.url })
          .eq('id', user.id);
          
        if (error) throw error;
        
        if (linkData.id) {
          // Update existing link
          setLinks(prevLinks => 
            prevLinks.map(link => 
              link.id === linkData.id ? { 
                ...linkData, 
                id: link.id,
                icon: getIconForLinkType(fieldToUpdate)
              } as LinkType : link
            )
          );
          
          toast({
            title: "Link updated",
            description: "Your link has been updated successfully",
          });
        } else {
          // Add new link
          const newLink = {
            ...linkData,
            id: `${fieldToUpdate}-link`,
            icon: getIconForLinkType(fieldToUpdate)
          } as LinkType;
          
          setLinks(prevLinks => {
            // Replace if exists, add if not
            const exists = prevLinks.some(link => link.id === newLink.id);
            return exists 
              ? prevLinks.map(link => link.id === newLink.id ? newLink : link)
              : [...prevLinks, newLink];
          });
          
          toast({
            title: "Link added",
            description: "Your new link has been added successfully",
          });
        }
        
        // Refresh profile data to get the updated links
        refreshProfile();
      } else {
        // The link type wasn't recognized, but we'll save it anyway
        const unknownType = type || 'custom';
        const newLink = {
          ...linkData,
          id: linkData.id || `custom-${Date.now()}`,
          icon: getIconForLinkType('website') // Default icon
        } as LinkType;
        
        setLinks(prevLinks => [...prevLinks, newLink]);
        
        toast({
          title: "Link added",
          description: "Your custom link has been added. Note that it won't be saved to your profile.",
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

  const getIconForLinkType = (type: string) => {
    if (type === 'linkedin') return <Linkedin className="h-4 w-4" />;
    if (type === 'website') return <Globe className="h-4 w-4" />;
    if (type === 'email') return <Mail className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const handleDeleteLink = async (linkId: string) => {
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

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader userData={userData} />
      
      <div className="flex flex-1 relative">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex flex-col flex-1">
          <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="flex-1 py-4 md:py-8 px-4 md:px-8 overflow-auto">
            {activeTab === "overview" && (
              <OverviewTab 
                userData={userData} 
                links={links}
                onOpenLinkEditor={handleOpenLinkEditor}
                onDeleteLink={handleDeleteLink}
                onNavigateToTab={handleNavigateToTab}
              />
            )}
            
            {activeTab === "links" && (
              <LinksTab 
                links={links}
                onOpenLinkEditor={handleOpenLinkEditor}
                onDeleteLink={handleDeleteLink}
              />
            )}
            
            {activeTab === "network" && (
              <NetworkTab />
            )}
            
            {activeTab === "appearance" && (
              <AppearanceTab 
                userData={userData} 
                links={links}
              />
            )}
            
            {activeTab === "analytics" && (
              <AnalyticsTab />
            )}
            
            {activeTab === "settings" && (
              <SettingsTab 
                userData={userData}
              />
            )}
          </main>
        </div>
      </div>
      
      <LinkEditor 
        isOpen={isLinkEditorOpen} 
        onClose={handleCloseLinkEditor}
        onSave={handleSaveLink}
        editingLink={currentEditingLink}
      />
      
      <Footer />
    </div>
  );
};

export default Dashboard;
