import { useState } from 'react';
import { Event } from '@/hooks/useEvents';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { EventCard } from './EventCard';
import { useUserParticipations } from '@/hooks/useUserParticipations';

interface EventCalendarProps {
  events: Event[];
}

export const EventCalendar = ({ events }: EventCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { participatingEventIds } = useUserParticipations();

  const eventDates = events.map(e => new Date(e.event_date));
  const eventsOnSelectedDate = selectedDate
    ? events.filter(e => isSameDay(new Date(e.event_date), selectedDate))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6 lg:col-span-1">
        <h3 className="font-semibold mb-4">Select Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border pointer-events-auto"
          modifiers={{
            hasEvent: eventDates
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: 'bold',
              textDecoration: 'underline'
            }
          }}
        />
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            <Badge variant="outline">{events.length}</Badge> total events
          </p>
          {selectedDate && (
            <p className="text-sm">
              {eventsOnSelectedDate.length} event{eventsOnSelectedDate.length !== 1 ? 's' : ''} on{' '}
              {format(selectedDate, 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </Card>

      <div className="lg:col-span-2">
        {eventsOnSelectedDate.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Events on {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {eventsOnSelectedDate.map(event => (
                <EventCard key={event.id} event={event} initialParticipating={participatingEventIds.has(event.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full border rounded-lg">
            <p className="text-muted-foreground">
              {selectedDate 
                ? `No events on ${format(selectedDate, 'MMM dd, yyyy')}`
                : 'Select a date to view events'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
