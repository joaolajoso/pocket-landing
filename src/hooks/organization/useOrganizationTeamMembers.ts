import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  avatar_url: string | null;
  slug: string | null;
  custom_title?: string | null;
  is_featured: boolean;
}

export const useOrganizationTeamMembers = (organizationId?: string) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        
        // Public-safe: fetch active profiles by organization_id
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, photo_url, avatar_url, slug, job_title, status')
          .eq('organization_id', organizationId)
          .eq('status', 'active')
          .order('name', { ascending: true });

        if (error) throw error;

        const members: TeamMember[] = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name || 'Sem nome',
          position: p.job_title || 'Colaborador',
          photo_url: p.photo_url,
          avatar_url: p.avatar_url,
          slug: p.slug,
          is_featured: false,
        }));

        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [organizationId]);

  return { teamMembers, loading };
};
