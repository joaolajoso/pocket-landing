import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StandVisit {
  stand_id: string;
  stand_name: string;
  company_name: string;
  stand_number: number;
  first_visit: string;
}

export interface ParticipantMetrics {
  connections: any[];
  profileViews: number;
  standVisits: StandVisit[];
  loading: boolean;
}

export const useParticipantMetrics = (eventId: string, userId: string) => {
  const [metrics, setMetrics] = useState<ParticipantMetrics>({
    connections: [],
    profileViews: 0,
    standVisits: [],
    loading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userId) {
        setMetrics(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Get event details for date range
        const { data: event } = await supabase
          .from('events')
          .select('event_date, end_date, title')
          .eq('id', eventId)
          .single();

        if (!event) {
          setMetrics(prev => ({ ...prev, loading: false }));
          return;
        }

        // Get connections during event (using tag from auto_tag_event_connections trigger)
        const { data: connections } = await supabase
          .from('connections')
          .select(`
            *,
            connected_user:profiles!connected_user_id(id, name, photo_url, username, slug)
          `)
          .eq('user_id', userId)
          .eq('tag', event.title)
          .order('created_at', { ascending: false });

        // Get profile views count
        const { count: profileViews } = await supabase
          .from('event_participant_metrics')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('participant_id', userId)
          .eq('metric_type', 'profile_view');

        // Get stand visits (chronological, first visit only)
        const { data: standMetrics } = await supabase
          .from('event_participant_metrics')
          .select(`
            captured_at,
            metadata
          `)
          .eq('event_id', eventId)
          .eq('participant_id', userId)
          .eq('metric_type', 'profile_view')
          .not('metadata->stand_id', 'is', null)
          .order('captured_at', { ascending: true });

        // Group by stand_id, keep only first visit
        const uniqueStandVisits: Record<string, any> = {};
        if (standMetrics) {
          for (const metric of standMetrics) {
            const metadata = metric.metadata as any;
            const standId = metadata?.stand_id;
            if (standId && !uniqueStandVisits[standId]) {
              uniqueStandVisits[standId] = {
                stand_id: standId,
                first_visit: metric.captured_at,
              };
            }
          }
        }

        // Fetch stand details
        const standIds = Object.keys(uniqueStandVisits);
        if (standIds.length > 0) {
          const { data: stands } = await supabase
            .from('event_stands')
            .select('id, stand_name, company_name, stand_number')
            .in('id', standIds);

          if (stands) {
            const standVisits = stands.map(stand => ({
              ...stand,
              stand_id: stand.id,
              first_visit: uniqueStandVisits[stand.id].first_visit,
            })).sort((a, b) => 
              new Date(a.first_visit).getTime() - new Date(b.first_visit).getTime()
            );

            setMetrics({
              connections: connections || [],
              profileViews: profileViews || 0,
              standVisits,
              loading: false,
            });
            return;
          }
        }

        setMetrics({
          connections: connections || [],
          profileViews: profileViews || 0,
          standVisits: [],
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching participant metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, [eventId, userId]);

  return metrics;
};
