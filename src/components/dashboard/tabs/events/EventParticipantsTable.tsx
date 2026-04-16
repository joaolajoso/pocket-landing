import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/hooks/useEvents';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface EventParticipantsTableProps {
  events: Event[];
}

interface ParticipantData {
  event_id: string;
  event_title: string;
  user_name: string;
  user_email: string;
  action_type: 'click' | 'participate';
  timestamp: string;
}

export const EventParticipantsTable = ({ events }: EventParticipantsTableProps) => {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [events]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);

      // Fetch participants with user profiles
      const { data: participantsData, error: participantsError } = await supabase
        .from('event_participants')
        .select('event_id, user_id, created_at');

      if (participantsError) throw participantsError;

      // Fetch clicks with user profiles
      const { data: clicksData, error: clicksError } = await supabase
        .from('event_clicks')
        .select('event_id, user_id, clicked_at');

      if (clicksError) throw clicksError;

      // Get unique user IDs
      const userIds = new Set([
        ...(participantsData || []).map(p => p.user_id),
        ...(clicksData || []).map(c => c.user_id)
      ]);

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Combine and format data
      const combined: ParticipantData[] = [
        ...(participantsData || []).map((p: any) => {
          const profile = profilesMap.get(p.user_id);
          return {
            event_id: p.event_id,
            event_title: events.find(e => e.id === p.event_id)?.title || 'Unknown Event',
            user_name: profile?.name || 'Unknown User',
            user_email: profile?.email || '',
            action_type: 'participate' as const,
            timestamp: p.created_at,
          };
        }),
        ...(clicksData || []).map((c: any) => {
          const profile = profilesMap.get(c.user_id);
          return {
            event_id: c.event_id,
            event_title: events.find(e => e.id === c.event_id)?.title || 'Unknown Event',
            user_name: profile?.name || 'Unknown User',
            user_email: profile?.email || '',
            action_type: 'click' as const,
            timestamp: c.clicked_at,
          };
        }),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setParticipants(combined);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No participants or clicks yet.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant, index) => (
            <TableRow key={`${participant.event_id}-${participant.user_email}-${participant.action_type}-${index}`}>
              <TableCell className="font-medium">{participant.event_title}</TableCell>
              <TableCell>{participant.user_name}</TableCell>
              <TableCell className="text-muted-foreground">{participant.user_email}</TableCell>
              <TableCell>
                <Badge variant={participant.action_type === 'participate' ? 'default' : 'secondary'}>
                  {participant.action_type === 'participate' ? 'Participating' : 'Clicked Link'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(participant.timestamp), 'MMM dd, yyyy HH:mm')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
