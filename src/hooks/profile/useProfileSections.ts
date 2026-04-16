
import { useState, useEffect } from 'react';
import { ProfileSection, LinkType } from './types/profileSectionTypes';
import { fetchProfileSections } from './utils/sectionFetching';

/**
 * Hook to fetch and manage profile sections and their links
 */
export const useProfileSections = (profile: any) => {
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSections = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileId = profile.id;
        
        const sectionData = await fetchProfileSections(profileId);
        setSections(sectionData);
      } catch (error) {
        console.error('Error loading profile sections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, [profile]);

  return { sections, loading };
};

// Re-export LinkType and ProfileSection for backward compatibility
export type { ProfileSection, LinkType };
