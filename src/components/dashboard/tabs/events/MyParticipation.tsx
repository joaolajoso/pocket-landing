import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/hooks/useEvents';
import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface MyParticipationProps {
  events: Event[];
  timeFilter: 'upcoming' | 'past';
  setTimeFilter: (filter: 'upcoming' | 'past') => void;
}

export const MyParticipation = ({ events, timeFilter, setTimeFilter }: MyParticipationProps) => {
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyParticipation();
  }, [user?.id]);

  const fetchMyParticipation = async () => {
    if (!user) return;

    try {

      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          role,
          status,
          events!inner(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const evts = (data || []).map((p: any) => ({
        ...p.events,
      })) as Event[];
      
      setParticipatingEvents(evts);
    } catch (error) {
      console.error('Error fetching participation:', error);
    } finally {
      setLoading(false);
    }
  };

  const myEvents = participatingEvents.filter(e => {
    const eventEndDate = e.end_date ? new Date(e.end_date) : new Date(e.event_date);
    const now = new Date();
    const isPastEvent = eventEndDate < now;
    
    return timeFilter === 'past' ? isPastEvent : !isPastEvent;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (participatingEvents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          You haven't marked any events as participating yet.
        </p>
      </div>
    );
  }

  if (myEvents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={timeFilter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={timeFilter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('past')}
          >
            Past Events
          </Button>
        </div>
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {timeFilter === 'upcoming'
              ? 'No upcoming events. Check your past events!'
              : 'No past events found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={timeFilter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={timeFilter === 'past' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeFilter('past')}
        >
          Past Events
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myEvents.map((event) => (
          <EventCard key={event.id} event={event} initialParticipating={true} />
        ))}
      </div>
    </div>
  );
};
