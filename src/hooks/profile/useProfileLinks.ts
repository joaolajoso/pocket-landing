
import { useState, useEffect } from 'react';
import { ProfileSection, LinkType } from './types/profileSectionTypes';
import { fetchAllProfileLinks, AllLinksResult } from './utils/sectionFetching';

/**
 * Hook to fetch and manage all profile links including:
 * - Grouped links (sections)
 * - Social links
 * - Ungrouped links (standalone links)
 */
export const useProfileLinks = (profile: { id?: string } | null) => {
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [socialLinks, setSocialLinks] = useState<LinkType[]>([]);
  const [ungroupedLinks, setUngroupedLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadLinks = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchAllProfileLinks(profile.id);
        setSections(result.sections);
        setSocialLinks(result.socialLinks);
        setUngroupedLinks(result.ungroupedLinks);
      } catch (error) {
        console.error('Error loading profile links:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, [profile?.id]);

  // Combine grouped and ungrouped links for "My Links" section
  const allNonSocialLinks = [
    ...sections.flatMap(s => s.links),
    ...ungroupedLinks
  ];

  return { 
    sections, 
    socialLinks, 
    ungroupedLinks, 
    allNonSocialLinks,
    loading 
  };
};

// Re-export types
export type { ProfileSection, LinkType };
