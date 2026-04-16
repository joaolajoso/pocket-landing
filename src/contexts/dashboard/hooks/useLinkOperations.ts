
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LinkType } from "@/components/LinkCard";
import { determineLinkType, formatLinkUrl, getIconForLinkType } from "../utils/linkUtils";

/**
 * Hook for link save and delete operations
 */
export const useLinkOperations = (refreshProfile: () => void) => {
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Save a new link or update an existing one
   */
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
      // Get the icon type directly from the linkData
      const linkType = typeof linkData.icon === 'string' ? linkData.icon : 'website';
      
      // Determine which field to update in the database
      const { fieldToUpdate } = determineLinkType(linkData);
      
      // Format URL appropriately for UX convenience but don't restrict input
      const url = formatLinkUrl(linkData.url, fieldToUpdate);
      
      console.log(`Saving link type: ${linkType}, field: ${fieldToUpdate}, url: ${url}, title: ${linkData.title}`);
      
      // Create an update object with only the necessary fields
      const updateData: Record<string, any> = { 
        [fieldToUpdate]: url
      };
      
      // We won't try to update the title fields since they might not exist yet
      // This removes the dependency on the title columns existing in the database
        
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      toast({
        title: linkData.id ? "Link updated" : "Link added",
        description: `Your ${linkData.title} link has been saved to your profile.`,
      });
      
      refreshProfile();
      
      // Return the new link data for UI updates - preserve the selected icon type
      const newLinkId = linkData.id || `${fieldToUpdate}-link`;
      const newLink = {
        ...linkData,
        id: newLinkId,
        title: linkData.title,
        url: url,
        icon: linkType  // Use the provided icon type
      } as LinkType;
      
      return newLink;
      
    } catch (error) {
      console.error('Error saving link:', error);
      toast({
        title: "Error saving link",
        description: "There was a problem saving your link",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Delete a link
   */
  const deleteLink = async (linkId: string) => {
    if (!user) return;
    
    try {
      let fieldToUpdate: string | null = null;
      
      if (linkId === 'linkedin-link') {
        fieldToUpdate = 'linkedin';
      }
      else if (linkId === 'website-link') {
        fieldToUpdate = 'website';
      }
      else if (linkId === 'email-link') {
        fieldToUpdate = 'email';
      }
      
      if (fieldToUpdate) {
        // Create an update object with only the field we want to clear
        const updateData: Record<string, any> = { 
          [fieldToUpdate]: null
        };
        
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
          
        if (error) throw error;
        
        toast({
          title: "Link deleted",
          description: "Your link has been removed",
        });
        
        refreshProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Error deleting link",
        description: "There was a problem removing your link",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    saveLink,
    deleteLink
  };
};
