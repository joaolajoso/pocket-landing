import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveEventContext {
  eventId: string | null;
  isActive: boolean;
}

export const useActiveEventContext = (): ActiveEventContext => {
  const [eventContext, setEventContext] = useState<ActiveEventContext>({
    eventId: null,
    isActive: false,
  });

  useEffect(() => {
    const checkActiveEvent = async () => {
      // Try to get event ID from localStorage or URL
      const storedEventId = localStorage.getItem('active_event_id') || 
                           localStorage.getItem('current_event_id');
      
      // Also check URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlEventId = urlParams.get('event_id') || urlParams.get('eventId');
      
      const eventId = storedEventId || urlEventId;
      
      if (!eventId) {
        setEventContext({ eventId: null, isActive: false });
        return;
      }

      // Verify if event exists and is currently active
      const { data: event, error } = await supabase
        .from('events')
        .select('id, event_date, end_date')
        .eq('id', eventId)
        .single();

      if (error || !event) {
        setEventContext({ eventId: null, isActive: false });
        return;
      }

      // Check if event is within active period
      const now = new Date();
      const eventDate = new Date(event.event_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;

      const isActive = now >= eventDate && (!endDate || now <= endDate);

      setEventContext({
        eventId: event.id,
        isActive,
      });
    };

    checkActiveEvent();

    // Listen for storage changes (in case event is set in another tab)
    const handleStorageChange = () => {
      checkActiveEvent();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return eventContext;
};
