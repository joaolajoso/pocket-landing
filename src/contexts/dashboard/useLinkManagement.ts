import { useState, useEffect } from "react";
import { LinkType } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/hooks/profile/useProfileData";

export const useLinkManagement = (
  profile: ProfileData | null,
  refreshProfile: () => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
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
          icon: "linkedin"
        });
      }
      
      if (profile.website) {
        profileLinks.push({
          id: "website-link",
          title: "Website",
          url: profile.website.startsWith('http') ? profile.website : `https://${profile.website}`,
          icon: "globe"
        });
      }
      
      if (profile.email) {
        profileLinks.push({
          id: "email-link",
          title: "Email",
          url: `mailto:${profile.email}`,
          icon: "mail"
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

  const getIconForLinkType = (type: string): string => {
    if (type === 'linkedin') return "linkedin";
    if (type === 'website') return "globe";
    if (type === 'email') return "mail";
    return "user";
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
      let fieldToUpdate: string | null = null;
      let linkType = "";
      
      if (linkData.id) {
        linkType = linkData.id.split('-')[0];
        if (linkType === 'linkedin') fieldToUpdate = 'linkedin';
        else if (linkType === 'website') fieldToUpdate = 'website';
        else if (linkType === 'email') fieldToUpdate = 'email';
      } else {
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
        
        if (!fieldToUpdate) {
          fieldToUpdate = 'website';
          linkType = 'website';
        }
      }
      
      let url = linkData.url;
      if (fieldToUpdate === 'linkedin' && !url.startsWith('http')) {
        url = `https://linkedin.com/in/${url}`;
      } else if (fieldToUpdate === 'website' && !url.startsWith('http')) {
        url = `https://${url}`;
      }
      
      console.log(`Saving link type: ${linkType}, field: ${fieldToUpdate}, url: ${url}`);
      
      if (fieldToUpdate) {
        const { error } = await supabase
          .from('profiles')
          .update({ [fieldToUpdate]: url })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
        
        const newLinkId = linkData.id || `${linkType}-link`;
        const newLink = {
          ...linkData,
          id: newLinkId,
          url: url,
          icon: getIconForLinkType(fieldToUpdate)
        } as LinkType;
        
        setLinks(prevLinks => {
          const existingLinkIndex = prevLinks.findIndex(link => link.id === newLinkId);
          
          if (existingLinkIndex >= 0) {
            const updatedLinks = [...prevLinks];
            updatedLinks[existingLinkIndex] = newLink;
            return updatedLinks;
          } else {
            return [...prevLinks, newLink];
          }
        });
        
        toast({
          title: linkData.id ? "Link updated" : "Link added",
          description: `Your ${linkData.title} has been saved to your profile.`,
        });
        
        refreshProfile();
      } else {
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
      
      let fieldToUpdate: string | null = null;
      
      if (linkId === 'linkedin-link') fieldToUpdate = 'linkedin';
      else if (linkId === 'website-link') fieldToUpdate = 'website';
      else if (linkId === 'email-link') fieldToUpdate = 'email';
      
      if (fieldToUpdate) {
        const { error } = await supabase
          .from('profiles')
          .update({ [fieldToUpdate]: null })
          .eq('id', user.id);
          
        if (error) throw error;
        
        setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
        
        toast({
          title: "Link deleted",
          description: "Your link has been removed",
        });
        
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

  return {
    links,
    isLinkEditorOpen,
    currentEditingLink,
    openLinkEditor,
    closeLinkEditor,
    saveLink,
    deleteLink
  };
};
