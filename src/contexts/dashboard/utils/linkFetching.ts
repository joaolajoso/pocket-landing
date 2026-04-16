
import { supabase } from '@/integrations/supabase/client';
import { SectionWithLinks } from '../types/sectionTypes';
import { LinkType } from '@/hooks/profile/types/profileSectionTypes';

// Social network icons that should be excluded from My Links (they appear in Social Networks card)
const SOCIAL_ICONS = ["linkedin", "github", "instagram", "twitter", "facebook", "youtube", "tiktok", "whatsapp", "telegram"];

/**
 * Fetches link groups and their associated links for a user
 * Excludes social network links as they are managed separately
 */
export const fetchUserLinks = async (userId: string): Promise<SectionWithLinks[]> => {
  try {
    const { data: groups, error: groupsError } = await supabase
      .from('link_groups')
      .select('*')
      .eq('user_id', userId)
      .order('position');

    if (groupsError) throw groupsError;

    const { data: linkItems, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('position');

    if (linksError) throw linksError;

    console.log('Fetched groups:', groups);
    console.log('Fetched links:', linkItems);

    // Include all links for each group whether they're active or not
    // This allows users to see and manage inactive links in the dashboard
    const groupsWithLinks = groups.map((group: any) => ({
      id: group.id,
      title: group.title,
      displayTitle: group.display_title,
      active: group.active,
      links: linkItems
        .filter((link: any) => link.group_id === group.id && !SOCIAL_ICONS.includes(link.icon))
        .map((link: any) => ({
          id: link.id,
          title: link.title,
          url: link.url,
          icon: link.icon,
          active: link.active
        }))
    }));

    return groupsWithLinks;
  } catch (error) {
    console.error('Error fetching user links:', error);
    throw error;
  }
};
