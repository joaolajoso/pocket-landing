
/**
 * Type definitions for profile sections and links
 */

export interface LinkType {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  active?: boolean;
}

export interface ProfileSection {
  id: string;
  title: string;
  displayTitle: boolean;
  active: boolean;
  links: LinkType[];
}
