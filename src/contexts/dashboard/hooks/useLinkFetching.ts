
import { useState, useEffect } from 'react';
import { ProfileData } from '@/hooks/profile/useProfileData';
import { SectionWithLinks } from '../types/sectionTypes';
import { fetchUserLinks } from '../utils/linkFetching';
import { updateLinksState, removeFromLinksState } from '../utils/linkStateOperations';

/**
 * Hook to fetch and manage links organized by sections
 */
export const useLinkFetching = (profile: ProfileData | null) => {
  const [links, setLinks] = useState<SectionWithLinks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching links for profile:', profile.id);
        const groupsWithLinks = await fetchUserLinks(profile.id);
        console.log('Fetched groups with links:', groupsWithLinks);
        setLinks(groupsWithLinks);
      } catch (error) {
        console.error('Error fetching links:', error);
        setLinks([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent multiple rapid calls
    const timeoutId = setTimeout(fetchLinks, 100);
    return () => clearTimeout(timeoutId);
  }, [profile?.id]); // Only depend on profile.id to prevent unnecessary refetches

  /**
   * Update the links state with a new or updated link
   */
  const handleUpdateLinksState = (updatedLink: any) => {
    setLinks(prevLinks => updateLinksState(prevLinks, updatedLink));
  };

  /**
   * Remove a link from the links state
   */
  const handleRemoveFromLinksState = (linkId: string) => {
    setLinks(prevLinks => removeFromLinksState(prevLinks, linkId));
  };

  return {
    links,
    loading,
    updateLinksState: handleUpdateLinksState,
    removeFromLinksState: handleRemoveFromLinksState
  };
};

// Re-export the SectionWithLinks type for backward compatibility
export type { SectionWithLinks } from '../types/sectionTypes';
