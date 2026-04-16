
/**
 * Utility functions for link management
 */

import { LinkType } from "@/components/LinkCard";

/**
 * Returns the appropriate icon based on link type
 */
export const getIconForLinkType = (type: string): string => {
  // Simply return the type - we'll handle the icon mapping in the components
  return type; 
};

/**
 * Formats a URL with the appropriate protocol for user convenience
 * but doesn't restrict what a user can enter
 */
export const formatLinkUrl = (url: string, linkType: string): string => {
  // Only add protocols if the URL doesn't already have one
  if (linkType === 'email' || linkType === 'mail') {
    if (!url.startsWith('mailto:')) {
      return `mailto:${url.replace('mailto:', '')}`;
    }
  } else if (!url.includes('://') && !url.startsWith('mailto:')) {
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
  }
  
  return url;
};

/**
 * Determines which database field to update based on link type
 * This doesn't validate or restrict the user's input
 */
export const determineLinkType = (
  linkData: Omit<LinkType, "id"> & { id?: string }
): { fieldToUpdate: string; linkType: string } => {
  // Extract the icon directly from the linkData - this is key for correct icon display
  const linkType = typeof linkData.icon === 'string' ? linkData.icon : 'website';
  let fieldToUpdate: string = 'website'; // Default database field
  
  // If we have an ID, extract the field from it
  if (linkData.id) {
    if (linkData.id.includes('linkedin')) {
      fieldToUpdate = 'linkedin';
    }
    else if (linkData.id.includes('email')) {
      fieldToUpdate = 'email';
    }
    else {
      // Default to website for any other type
      fieldToUpdate = 'website';
    }
  } 
  else {
    // Determine the database field to update based on the link type
    if (linkType === 'linkedin') {
      fieldToUpdate = 'linkedin';
    }
    else if (linkType === 'email' || linkType === 'mail') {
      fieldToUpdate = 'email';
    }
    else {
      // Default to website for all other types
      fieldToUpdate = 'website';
    }
  }
  
  return { fieldToUpdate, linkType };
};
