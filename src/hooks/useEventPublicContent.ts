import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventPublicContent {
  timeline: any[];
  map: any | null;
  areas: any[];
  customSections: any[];
  loading: boolean;
}

export const useEventPublicContent = (eventId: string) => {
  const [publicContent, setPublicContent] = useState<EventPublicContent>({
    timeline: [],
    map: null,
    areas: [],
    customSections: [],
    loading: true,
  });

  useEffect(() => {
    const fetchPublicContent = async () => {
      try {
        // Fetch custom content
        const { data: contentData } = await supabase
          .from('event_custom_content')
          .select('*')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .order('position', { ascending: true });

        // Fetch areas
        const { data: areasData } = await supabase
          .from('event_areas')
          .select('*')
          .eq('event_id', eventId)
          .order('name', { ascending: true });

        // Process content by type
        const timeline = contentData?.filter(c => c.section_type === 'timeline') || [];
        const map = contentData?.find(c => c.section_type === 'map') || null;
        const customSections = contentData?.filter(c => 
          c.section_type === 'info' || c.section_type === 'sponsors'
        ) || [];

        setPublicContent({
          timeline,
          map,
          areas: areasData || [],
          customSections,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching public content:', error);
        setPublicContent(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPublicContent();
  }, [eventId]);

  return publicContent;
};