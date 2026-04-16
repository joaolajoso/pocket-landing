import { SectionWithLinks } from '../types/sectionTypes';
import { LinkType } from '@/hooks/profile/types/profileSectionTypes';

/**
 * Updates the links state with a new or updated link
 */
export const updateLinksState = (
  links: SectionWithLinks[], 
  updatedLink: any
): SectionWithLinks[] => {
  // If the link has a section, add it to that section
  if (updatedLink.section) {
    const linkExists = links.some(section => 
      section.links.some(link => link.id === updatedLink.id)
    );

    if (linkExists) {
      // Update existing link
      return links.map(section => ({
        ...section,
        links: section.links.map(link => 
          link.id === updatedLink.id ? {
            id: updatedLink.id,
            title: updatedLink.title,
            url: updatedLink.url,
            icon: updatedLink.icon,
            active: updatedLink.active
          } : link
        )
      }));
    } else {
      // Add new link to appropriate section
      return links.map(section => {
        if (section.id === updatedLink.section) {
          return {
            ...section,
            links: [
              ...section.links,
              {
                id: updatedLink.id,
                title: updatedLink.title,
                url: updatedLink.url,
                icon: updatedLink.icon,
                active: updatedLink.active !== false
              }
            ]
          };
        }
        return section;
      });
    }
  }
  
  // If no section specified, return unchanged links
  return links;
};

/**
 * Removes a link from the links state
 */
export const removeFromLinksState = (
  links: SectionWithLinks[], 
  linkId: string
): SectionWithLinks[] => {
  return links.map(section => ({
    ...section,
    links: section.links.filter(link => link.id !== linkId)
  }));
};
