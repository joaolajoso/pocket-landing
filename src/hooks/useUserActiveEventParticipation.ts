import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActiveEvent {
  eventId: string;
  role: 'participant' | 'stand' | 'organizer';
  title: string;
}

interface ActiveEventParticipation {
  eventId: string | null;
  isParticipant: boolean;
  isEventActive: boolean;
  role: 'participant' | 'stand' | 'organizer' | null;
  loading: boolean;
  allActiveEvents: ActiveEvent[];
}

const LAST_FOCUS_EVENT_KEY = 'last_focus_event_id';

/**
 * Hook to check if the current authenticated user is a participant
 * in any currently active event (participating until end date)
 */
export const useUserActiveEventParticipation = (): ActiveEventParticipation => {
  const { user } = useAuth();
  const [state, setState] = useState<ActiveEventParticipation>({
    eventId: null,
    isParticipant: false,
    isEventActive: false,
    role: null,
    loading: true,
    allActiveEvents: [],
  });

  useEffect(() => {
    const checkActiveEventParticipation = async () => {
      if (!user?.id) {
        setState({
          eventId: null,
          isParticipant: false,
          isEventActive: false,
          role: null,
          loading: false,
          allActiveEvents: [],
        });
        return;
      }

      try {
        const now = new Date();

        const { data: participations, error } = await supabase
          .from('event_participants')
          .select(`
            event_id,
            role,
            events!inner(
              id,
              event_date,
              end_date,
              title
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['participating', 'registered']);

        if (error) {
          console.error('Error checking active event participation:', error);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        // Filter for events where user is participating and event hasn't ended yet
        const activeParticipations = participations?.filter((p: any) => {
          const eventEnd = p.events.end_date 
            ? new Date(p.events.end_date) 
            : new Date(p.events.event_date);
          eventEnd.setHours(23, 59, 59, 999);
          return now <= eventEnd;
        }) || [];

        if (activeParticipations.length > 0) {
          const allActiveEvents: ActiveEvent[] = activeParticipations.map((p: any) => ({
            eventId: p.event_id,
            role: p.role as 'participant' | 'stand' | 'organizer',
            title: p.events.title,
          }));

          // Try to restore last chosen event from localStorage
          const lastEventId = localStorage.getItem(LAST_FOCUS_EVENT_KEY);
          const lastEvent = allActiveEvents.find(e => e.eventId === lastEventId);
          const selectedEvent = lastEvent || allActiveEvents[0];

          setState({
            eventId: selectedEvent.eventId,
            isParticipant: true,
            isEventActive: true,
            role: selectedEvent.role,
            loading: false,
            allActiveEvents,
          });
        } else {
          localStorage.removeItem(LAST_FOCUS_EVENT_KEY);
          setState({
            eventId: null,
            isParticipant: false,
            isEventActive: false,
            role: null,
            loading: false,
            allActiveEvents: [],
          });
        }
      } catch (error) {
        console.error('Unexpected error checking event participation:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkActiveEventParticipation();
    const interval = setInterval(checkActiveEventParticipation, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return state;
};

export const setLastFocusEvent = (eventId: string) => {
  localStorage.setItem(LAST_FOCUS_EVENT_KEY, eventId);
};
