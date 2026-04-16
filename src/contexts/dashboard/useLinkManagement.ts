
import { ProfileData } from "@/hooks/profile/useProfileData";
import { LinkType } from "@/components/LinkCard";
import { useLinkEditor } from "./hooks/useLinkEditor";
import { useLinkOperations } from "./hooks/useLinkOperations";
import { useLinkFetching, SectionWithLinks } from "./hooks/useLinkFetching";

/**
 * Main hook for managing links in the user's profile
 */
export const useLinkManagement = (
  profile: ProfileData | null,
  refreshProfile: () => void
) => {
  // Hook for link fetching and state management
  const { links, updateLinksState, removeFromLinksState } = useLinkFetching(profile);
  
  // Hook for link editor UI state
  const { isLinkEditorOpen, currentEditingLink, currentSectionId, openLinkEditor, closeLinkEditor } = useLinkEditor();
  
  // Hook for link operations (save/delete)
  const { saveLink: saveLinkOperation, deleteLink: deleteLinkOperation } = useLinkOperations(refreshProfile);

  // Enhanced openLinkEditor that uses the current links
  const handleOpenLinkEditor = (linkId?: string, sectionId?: string) => {
    openLinkEditor(linkId, sectionId, links as any); // Type cast to avoid TS error
  };

  // Enhanced saveLink that updates the local state
  const saveLink = async (linkData: Omit<LinkType, "id"> & { id?: string, section?: string }) => {
    const newLink = await saveLinkOperation(linkData);
    if (newLink) {
      updateLinksState(newLink);
    }
  };

  // Enhanced deleteLink that updates the local state
  const deleteLink = async (linkId: string) => {
    const success = await deleteLinkOperation(linkId);
    if (success) {
      removeFromLinksState(linkId);
    }
  };

  return {
    links,
    isLinkEditorOpen,
    currentEditingLink,
    currentSectionId,
    openLinkEditor: handleOpenLinkEditor,
    closeLinkEditor,
    saveLink,
    deleteLink
  };
};
