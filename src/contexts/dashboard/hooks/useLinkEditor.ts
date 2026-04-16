
import { useState } from "react";
import { LinkType } from "@/components/LinkCard";

/**
 * Hook for managing link editor state
 */
export const useLinkEditor = () => {
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<LinkType | undefined>(undefined);
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);

  const openLinkEditor = (linkId?: string, sectionId?: string, links?: LinkType[]) => {
    if (linkId && links) {
      const linkToEdit = links.find(link => link.id === linkId);
      setCurrentEditingLink(linkToEdit);
    } else {
      setCurrentEditingLink(undefined);
    }
    setCurrentSectionId(sectionId);
    setIsLinkEditorOpen(true);
  };

  const closeLinkEditor = () => {
    setIsLinkEditorOpen(false);
    setCurrentEditingLink(undefined);
    setCurrentSectionId(undefined);
  };

  return {
    isLinkEditorOpen,
    currentEditingLink,
    currentSectionId,
    openLinkEditor,
    closeLinkEditor
  };
};
