
import { useState, useEffect } from 'react';

export interface ProfileSection {
  id: string;
  title: string;
  links: LinkType[];
}

export interface LinkType {
  id: string;
  title: string;
  url: string;
  icon: string | null;
}

export const useProfileSections = (profile: any) => {
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (profile) {
      const contactLinks = [];
      
      if (profile.email) {
        contactLinks.push({
          id: 'email-link',
          title: 'Email',
          url: `mailto:${profile.email}`,
          icon: null
        });
      }
      
      if (profile.linkedin) {
        contactLinks.push({
          id: 'linkedin-link',
          title: 'LinkedIn',
          url: profile.linkedin.startsWith('http') 
            ? profile.linkedin 
            : `https://linkedin.com/in/${profile.linkedin}`,
          icon: null
        });
      }
      
      if (profile.website) {
        contactLinks.push({
          id: 'website-link',
          title: 'Website',
          url: profile.website.startsWith('http') 
            ? profile.website 
            : `https://${profile.website}`,
          icon: null
        });
      }
      
      const sections = [];
      
      if (contactLinks.length > 0) {
        sections.push({
          id: 'contact-section',
          title: 'Contact Information',
          links: contactLinks
        });
      }
      
      setSections(sections);
      setLoading(false);
    }
  }, [profile]);

  return { sections, loading };
};
