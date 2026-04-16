
import { LinkType } from '@/hooks/profile/types/profileSectionTypes';

export interface SectionWithLinks {
  id: string; 
  title: string; 
  displayTitle: boolean;
  active: boolean;
  links: LinkType[];
}
