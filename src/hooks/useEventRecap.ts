import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RecapBadge {
  type: 'top_networker' | 'top_visitor' | 'top_communicator' | 'rising_star';
  label: string;
  icon: string;
  rank: number;
}

export interface RecapConnection {
  id: string;
  name: string;
  photo_url: string | null;
  username: string | null;
  slug: string | null;
}

export interface RecapStats {
  connections: number;
  profileViews: number;
  standsVisited: number;
  messagesSent: number;
  meetingsScheduled: number;
}

export interface RecapRanking {
  metric: string;
  rank: number;
  total: number;
}

export interface EventRecapData {
  eventTitle: string;
  eventDate: string;
  eventEndDate: string | null;
  eventImageUrl: string | null;
  stats: RecapStats;
  rankings: RecapRanking[];
  badges: RecapBadge[];
  connections: RecapConnection[];
  standVisits: { standName: string; companyName: string | null; visitedAt: string }[];
  leaderboard: {
    topNetworkers: { userId: string; name: string; photoUrl: string | null; count: number }[];
    topVisitors: { userId: string; name: string; photoUrl: string | null; count: number }[];
    topCommunicators: { userId: string; name: string; photoUrl: string | null; count: number }[];
  };
  totalParticipants: number;
}

export const useEventRecap = (eventId: string) => {
  const { user } = useAuth();
  const [recap, setRecap] = useState<EventRecapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId || !user?.id) return;
    fetchRecap();
  }, [eventId, user?.id]);

  const fetchRecap = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // 1. Event details
      const { data: event } = await supabase
        .from('events')
        .select('title, event_date, end_date, image_url')
        .eq('id', eventId)
        .single();

      if (!event) throw new Error('Event not found');

      // 2. All participants
      const { data: participants } = await supabase
        .from('event_participants')
        .select('user_id, role')
        .eq('event_id', eventId);

      const participantUserIds = participants?.map(p => p.user_id) || [];
      const totalParticipants = participantUserIds.length;

      // 3. Profiles for all participants
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, slug')
        .in('id', participantUserIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // 4. My connections during event (tagged with event title)
      const { data: myConnections } = await supabase
        .from('connections')
        .select(`
          connected_user_id,
          connected_user:profiles!connected_user_id(id, name, photo_url, slug)
        `)
        .eq('user_id', user.id)
        .eq('tag', event.title);

      // 5. All connections for ranking
      const { data: allConnections } = await supabase
        .from('connections')
        .select('user_id')
        .eq('tag', event.title)
        .in('user_id', participantUserIds);

      // 6. Profile views during event
      let myViews = 0;
      const viewsByUser = new Map<string, number>();
      if (participantUserIds.length > 0) {
        let viewsQuery = supabase
          .from('profile_views')
          .select('profile_id')
          .in('profile_id', participantUserIds)
          .gte('timestamp', event.event_date);
        if (event.end_date) viewsQuery = viewsQuery.lte('timestamp', event.end_date);
        const { data: viewsData } = await viewsQuery;
        viewsData?.forEach((v: any) => {
          viewsByUser.set(v.profile_id, (viewsByUser.get(v.profile_id) || 0) + 1);
        });
        myViews = viewsByUser.get(user.id) || 0;
      }

      // 7. Stand visits (from event_participant_metrics)
      const { data: standMetrics } = await supabase
        .from('event_participant_metrics')
        .select('captured_at, metadata')
        .eq('event_id', eventId)
        .eq('participant_id', user.id)
        .eq('metric_type', 'profile_view')
        .not('metadata->stand_id', 'is', null)
        .order('captured_at', { ascending: true });

      const uniqueStandIds = new Map<string, string>();
      standMetrics?.forEach((m: any) => {
        const standId = (m.metadata as any)?.stand_id;
        if (standId && !uniqueStandIds.has(standId)) {
          uniqueStandIds.set(standId, m.captured_at);
        }
      });

      let standVisits: { standName: string; companyName: string | null; visitedAt: string }[] = [];
      if (uniqueStandIds.size > 0) {
        const { data: stands } = await supabase
          .from('event_stands')
          .select('id, stand_name, company_name')
          .in('id', Array.from(uniqueStandIds.keys()));
        standVisits = (stands || []).map(s => ({
          standName: s.stand_name || `Stand`,
          companyName: s.company_name,
          visitedAt: uniqueStandIds.get(s.id) || '',
        }));
      }

      // 8. Messages sent via meeting requests
      const { data: meetingRequests } = await supabase
        .from('event_meeting_requests')
        .select('id')
        .eq('event_id', eventId);

      const mrIds = meetingRequests?.map(mr => mr.id) || [];
      let myMessages = 0;
      const messagesByUser = new Map<string, number>();
      if (mrIds.length > 0) {
        const { data: messages } = await supabase
          .from('event_messages')
          .select('sender_id')
          .in('meeting_request_id', mrIds);
        messages?.forEach((m: any) => {
          messagesByUser.set(m.sender_id, (messagesByUser.get(m.sender_id) || 0) + 1);
        });
        myMessages = messagesByUser.get(user.id) || 0;
      }

      // 9. Scheduled meetings
      const { data: scheduledMeetings } = await supabase
        .from('event_scheduled_meetings')
        .select('scheduled_by')
        .eq('event_id', eventId);

      const myMeetings = scheduledMeetings?.filter(sm => sm.scheduled_by === user.id).length || 0;

      // 10. Calculate rankings
      const connectionsByUser = new Map<string, number>();
      allConnections?.forEach(c => {
        connectionsByUser.set(c.user_id, (connectionsByUser.get(c.user_id) || 0) + 1);
      });

      // Stand visits per user (from metrics)
      const { data: allStandMetrics } = await supabase
        .from('event_participant_metrics')
        .select('participant_id, metadata')
        .eq('event_id', eventId)
        .eq('metric_type', 'profile_view')
        .not('metadata->stand_id', 'is', null);

      const standVisitsByUser = new Map<string, Set<string>>();
      allStandMetrics?.forEach((m: any) => {
        const standId = (m.metadata as any)?.stand_id;
        if (standId) {
          if (!standVisitsByUser.has(m.participant_id)) standVisitsByUser.set(m.participant_id, new Set());
          standVisitsByUser.get(m.participant_id)!.add(standId);
        }
      });

      const myConnectionsCount = connectionsByUser.get(user.id) || (myConnections?.length || 0);
      const myStandsCount = uniqueStandIds.size;

      // Sort for rankings
      const sortedConnections = Array.from(connectionsByUser.entries()).sort((a, b) => b[1] - a[1]);
      const sortedViews = Array.from(viewsByUser.entries()).sort((a, b) => b[1] - a[1]);
      const sortedMessages = Array.from(messagesByUser.entries()).sort((a, b) => b[1] - a[1]);
      const sortedStands = Array.from(standVisitsByUser.entries())
        .map(([uid, set]) => [uid, set.size] as [string, number])
        .sort((a, b) => b[1] - a[1]);

      const getRank = (sorted: [string, number][], userId: string) => {
        const idx = sorted.findIndex(([uid]) => uid === userId);
        return idx === -1 ? sorted.length + 1 : idx + 1;
      };

      const connectionsRank = getRank(sortedConnections, user.id);
      const visitsRank = getRank(sortedStands, user.id);
      const messagesRank = getRank(sortedMessages, user.id);

      // Badges
      const badges: RecapBadge[] = [];
      if (connectionsRank <= 3 && myConnectionsCount > 0) {
        badges.push({ type: 'top_networker', label: 'Top Networker', icon: '🤝', rank: connectionsRank });
      }
      if (visitsRank <= 3 && myStandsCount > 0) {
        badges.push({ type: 'top_visitor', label: 'Top Visitor', icon: '🏃', rank: visitsRank });
      }
      if (messagesRank <= 3 && myMessages > 0) {
        badges.push({ type: 'top_communicator', label: 'Top Communicator', icon: '💬', rank: messagesRank });
      }
      // Rising Star: top 10% overall
      const overallScore = myConnectionsCount * 3 + myViews + myStandsCount * 2 + myMessages;
      const allScores = participantUserIds.map(uid => {
        return (connectionsByUser.get(uid) || 0) * 3 +
          (viewsByUser.get(uid) || 0) +
          (standVisitsByUser.get(uid)?.size || 0) * 2 +
          (messagesByUser.get(uid) || 0);
      }).sort((a, b) => b - a);
      const overallRank = allScores.filter(s => s > overallScore).length + 1;
      if (overallRank <= Math.max(1, Math.ceil(totalParticipants * 0.1)) && overallScore > 0) {
        badges.push({ type: 'rising_star', label: 'Rising Star', icon: '⭐', rank: overallRank });
      }

      // Leaderboard top 3
      const buildTop3 = (sorted: [string, number][]) =>
        sorted.slice(0, 3).map(([uid, count]) => {
          const p = profilesMap.get(uid);
          return { userId: uid, name: p?.name || 'Unknown', photoUrl: p?.photo_url || null, count };
        });

      // Connections list
      const recapConnections: RecapConnection[] = (myConnections || []).map((c: any) => ({
        id: c.connected_user?.id || c.connected_user_id,
        name: c.connected_user?.name || 'Unknown',
        photo_url: c.connected_user?.photo_url || null,
        username: null,
        slug: c.connected_user?.slug || null,
      }));

      setRecap({
        eventTitle: event.title,
        eventDate: event.event_date,
        eventEndDate: event.end_date,
        eventImageUrl: event.image_url,
        stats: {
          connections: myConnectionsCount,
          profileViews: myViews,
          standsVisited: myStandsCount,
          messagesSent: myMessages,
          meetingsScheduled: myMeetings,
        },
        rankings: [
          { metric: 'Connections', rank: connectionsRank, total: totalParticipants },
          { metric: 'Stands Visited', rank: visitsRank, total: totalParticipants },
          { metric: 'Messages', rank: messagesRank, total: totalParticipants },
        ],
        badges,
        connections: recapConnections,
        standVisits,
        leaderboard: {
          topNetworkers: buildTop3(sortedConnections),
          topVisitors: buildTop3(sortedStands),
          topCommunicators: buildTop3(sortedMessages),
        },
        totalParticipants,
      });
    } catch (error) {
      console.error('Error fetching event recap:', error);
    } finally {
      setLoading(false);
    }
  };

  return { recap, loading };
};
