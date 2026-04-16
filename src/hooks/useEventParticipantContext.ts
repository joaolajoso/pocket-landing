import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EventParticipantContext {
  eventId: string | null;
  isParticipant: boolean;
  role: 'participant' | 'stand' | 'organizer' | null;
  loading: boolean;
}

/**
 * Hook to check if a given profile is an active event participant
 * Used for tracking event metrics
 */
export const useEventParticipantContext = (profileId?: string): EventParticipantContext => {
  const [context, setContext] = useState<EventParticipantContext>({
    eventId: null,
    isParticipant: false,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const checkParticipation = async () => {
      console.log('🔍 [useEventParticipantContext] Checking participation for profile:', profileId);
      
      if (!profileId) {
        console.log('⚠️ [useEventParticipantContext] No profileId provided');
        setContext({ eventId: null, isParticipant: false, role: null, loading: false });
        return;
      }

      try {
        const now = new Date().toISOString();
        console.log('🕐 [useEventParticipantContext] Current time:', now);
        
        // Find active events where profileId is a participant
        const { data: participation, error } = await supabase
          .from('event_participants')
          .select(`
            event_id,
            role,
            events!inner(
              event_date,
              end_date,
              title
            )
          `)
          .eq('user_id', profileId)
          .lte('events.event_date', now)
          .or(`events.end_date.gte.${now},events.end_date.is.null`)
          .maybeSingle();

        console.log('📊 [useEventParticipantContext] Query result:', { participation, error });

        if (error) {
          console.error('❌ [useEventParticipantContext] Error checking event participation:', error);
          console.log('Query params:', { profileId, now });
          setContext({ eventId: null, isParticipant: false, role: null, loading: false });
          return;
        }

        if (participation) {
          console.log('✅ [useEventParticipantContext] Active event found:', {
            eventId: participation.event_id,
            role: participation.role,
            eventTitle: participation.events?.title
          });
          setContext({
            eventId: participation.event_id,
            isParticipant: true,
            role: participation.role as 'participant' | 'stand' | 'organizer',
            loading: false,
          });
        } else {
          console.warn('⚠️ [useEventParticipantContext] No active event found for profile:', profileId);
          setContext({ eventId: null, isParticipant: false, role: null, loading: false });
        }
      } catch (error) {
        console.error('❌ [useEventParticipantContext] Unexpected error:', error);
        setContext({ eventId: null, isParticipant: false, role: null, loading: false });
      }
    };

    checkParticipation();
  }, [profileId]);

  return context;
};
