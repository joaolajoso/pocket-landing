
import { supabase } from '@/integrations/supabase/client';
import { ProfileSection, LinkType } from '../types/profileSectionTypes';

// Social network icons that are shown in the social networks section
const SOCIAL_ICONS = ["linkedin", "github", "instagram", "twitter", "facebook", "youtube", "tiktok", "whatsapp", "telegram"];

export interface AllLinksResult {
  sections: ProfileSection[];
  socialLinks: LinkType[];
  ungroupedLinks: LinkType[];
}

/**
 * Fetches all links for a profile and organizes them into:
 * - sections: links grouped by link_groups
 * - socialLinks: links with social icons (for social networks display)
 * - ungroupedLinks: links without a group that are not social (for My Links)
 */
export const fetchAllProfileLinks = async (profileId: string): Promise<AllLinksResult> => {
  if (!profileId) {
    console.error('No profile ID provided for link fetching');
    return { sections: [], socialLinks: [], ungroupedLinks: [] };
  }
  
  console.log('Fetching all links for profile ID:', profileId);

  try {
    // Fetch all link groups and links in parallel
    const [groupsResult, linksResult] = await Promise.all([
      supabase
        .from('link_groups')
        .select('*')
        .eq('user_id', profileId)
        .eq('active', true)
        .order('position'),
      supabase
        .from('links')
        .select('*')
        .eq('user_id', profileId)
        .eq('active', true)
        .order('position')
    ]);

    if (groupsResult.error) {
      console.error('Error fetching link groups:', groupsResult.error);
      return { sections: [], socialLinks: [], ungroupedLinks: [] };
    }

    if (linksResult.error) {
      console.error('Error fetching links:', linksResult.error);
      return { sections: [], socialLinks: [], ungroupedLinks: [] };
    }

    const groups = groupsResult.data || [];
    const links = linksResult.data || [];

    console.log('Fetched link groups:', groups);
    console.log('Fetched all links:', links);

    // Separate links into categories
    const socialLinks: LinkType[] = [];
    const ungroupedLinks: LinkType[] = [];
    const groupedLinksMap = new Map<string, LinkType[]>();

    // Initialize grouped links map
    groups.forEach((group: any) => {
      groupedLinksMap.set(group.id, []);
    });

    // Categorize each link
    links.forEach((link: any) => {
      const linkData: LinkType = {
        id: link.id,
        title: link.title,
        url: link.url,
        icon: link.icon
      };

      const isSocialIcon = SOCIAL_ICONS.includes(link.icon?.toLowerCase());

      if (link.group_id && groupedLinksMap.has(link.group_id)) {
        // Link belongs to a group - add to that group (excluding social icons from grouped display)
        if (!isSocialIcon) {
          groupedLinksMap.get(link.group_id)!.push(linkData);
        }
      }
      
      // Social icons always go to socialLinks section
      if (isSocialIcon) {
        socialLinks.push(linkData);
      } else if (!link.group_id) {
        // Non-social links without a group go to ungroupedLinks
        ungroupedLinks.push(linkData);
      }
    });

    // Build sections from groups (only groups with links)
    const sections: ProfileSection[] = groups
      .map((group: any) => ({
        id: group.id,
        title: group.title,
        displayTitle: group.display_title ?? true,
        active: group.active,
        links: groupedLinksMap.get(group.id) || []
      }))
      .filter((section: ProfileSection) => section.links.length > 0);
    
    console.log('Processed sections:', sections);
    console.log('Social links:', socialLinks);
    console.log('Ungrouped links:', ungroupedLinks);

    return { sections, socialLinks, ungroupedLinks };
  } catch (error) {
    console.error('Error fetching profile links:', error);
    return { sections: [], socialLinks: [], ungroupedLinks: [] };
  }
};

/**
 * Legacy function for backward compatibility
 * Fetches sections and their links from Supabase
 */
export const fetchProfileSections = async (profileId: string): Promise<ProfileSection[]> => {
  const result = await fetchAllProfileLinks(profileId);
  return result.sections;
};
