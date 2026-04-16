import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventMetrics {
  totalParticipants: number;
  totalViews: number;
  totalConnections: number;
  totalLeads: number;
  totalMeetingRequests: number;
  totalMessages: number;
  totalScheduledMeetings: number;
  participantMetrics: {
    role: 'participant' | 'stand' | 'organizer';
    views: number;
    clicks: number;
    leads: number;
    connections: number;
    meetingRequests: number;
    messages: number;
    scheduledMeetings: number;
  }[];
  liveMetrics: {
    user_id: string;
    user_name: string;
    role: 'participant' | 'stand' | 'organizer';
    views_during_event: number;
    clicks_during_event: number;
    leads_during_event: number;
    connections_during_event: number;
    stand_visits_during_event: number;
    meeting_requests_during_event: number;
    messages_during_event: number;
    scheduled_meetings_during_event: number;
  }[];
}

const emptyMetrics: EventMetrics = {
  totalParticipants: 0,
  totalViews: 0,
  totalConnections: 0,
  totalLeads: 0,
  totalMeetingRequests: 0,
  totalMessages: 0,
  totalScheduledMeetings: 0,
  participantMetrics: [],
  liveMetrics: [],
};

export const useEventMetrics = (eventId: string | undefined) => {
  const [metrics, setMetrics] = useState<EventMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (eventId) {
      fetchMetrics();
    }
  }, [eventId]);

  const fetchMetrics = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch event details for date range
      const { data: eventData } = await supabase
        .from('events')
        .select('event_date, end_date, title')
        .eq('id', eventId)
        .single();

      // Parallel fetches
      const [
        { count: participantsCount },
        { data: metricsData, error: metricsError },
        { data: participants, error: participantsError },
        { data: meetingRequests },
        { data: scheduledMeetings },
      ] = await Promise.all([
        supabase.from('event_participants').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
        supabase.from('event_participant_metrics').select('*').eq('event_id', eventId),
        supabase.from('event_participants').select('id, user_id, role').eq('event_id', eventId),
        supabase.from('event_meeting_requests').select('*').eq('event_id', eventId),
        supabase.from('event_scheduled_meetings').select('*').eq('event_id', eventId),
      ]);

      if (metricsError) throw metricsError;
      if (participantsError) throw participantsError;

      // Fetch user profiles
      const participantUserIds = participants?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', participantUserIds);

      // Views during event window - query profile_views directly with per-user breakdown
      let profileViewsByUser = new Map<string, number>();
      let profileViewsInEventCount = 0;
      if (participantUserIds.length > 0 && eventData?.event_date) {
        let profileViewsQuery = supabase
          .from('profile_views')
          .select('profile_id')
          .in('profile_id', participantUserIds)
          .gte('timestamp', eventData.event_date);

        if (eventData.end_date) {
          profileViewsQuery = profileViewsQuery.lte('timestamp', eventData.end_date);
        }

        const { data: viewsData } = await profileViewsQuery;
        if (viewsData) {
          profileViewsInEventCount = viewsData.length;
          viewsData.forEach((v: any) => {
            profileViewsByUser.set(v.profile_id, (profileViewsByUser.get(v.profile_id) || 0) + 1);
          });
        }
      }

      // Leads during event window - query contact_submissions directly with per-user breakdown
      let leadsByUser = new Map<string, number>();
      if (participantUserIds.length > 0 && eventData?.event_date) {
        let leadsQuery = supabase
          .from('contact_submissions')
          .select('profile_owner_id')
          .in('profile_owner_id', participantUserIds)
          .gte('created_at', eventData.event_date);

        if (eventData.end_date) {
          leadsQuery = leadsQuery.lte('created_at', eventData.end_date);
        }

        const { data: leadsData } = await leadsQuery;
        if (leadsData) {
          leadsData.forEach((l: any) => {
            leadsByUser.set(l.profile_owner_id, (leadsByUser.get(l.profile_owner_id) || 0) + 1);
          });
        }
      }

      // Clicks during event window - query profile_views with source LIKE 'click:%'
      let clicksByUser = new Map<string, number>();
      if (participantUserIds.length > 0 && eventData?.event_date) {
        let clicksQuery = supabase
          .from('profile_views')
          .select('profile_id')
          .in('profile_id', participantUserIds)
          .like('source', 'click:%')
          .gte('timestamp', eventData.event_date);

        if (eventData.end_date) {
          clicksQuery = clicksQuery.lte('timestamp', eventData.end_date);
        }

        const { data: clicksData } = await clicksQuery;
        if (clicksData) {
          clicksData.forEach((c: any) => {
            clicksByUser.set(c.profile_id, (clicksByUser.get(c.profile_id) || 0) + 1);
          });
        }
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch messages via meeting_request_ids
      const meetingRequestIds = meetingRequests?.map(mr => mr.id) || [];
      let messagesData: any[] = [];
      if (meetingRequestIds.length > 0) {
        const { data } = await supabase
          .from('event_messages')
          .select('*')
          .in('meeting_request_id', meetingRequestIds);
        messagesData = data || [];
      }

      // Fetch connections made during the event
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('user_id, connected_user_id, created_at, tag')
        .or(`tag.eq.${eventData?.title},and(created_at.gte.${eventData?.event_date},created_at.lte.${eventData?.end_date || new Date().toISOString()})`);

      const eventConnections = connectionsData?.filter(conn => {
        const userIsParticipant = participants?.some(p => p.user_id === conn.user_id);
        const connectedIsParticipant = participants?.some(p => p.user_id === conn.connected_user_id);
        return userIsParticipant && connectedIsParticipant;
      }) || [];

      const connectionMetrics = metricsData?.filter((m: any) => m.metric_type === 'connection') || [];
      const uniqueConnectionIds = new Set(
        connectionMetrics
          .map((metric: any) => {
            const metadata = metric.metadata as Record<string, any> | null;
            return typeof metadata?.connection_id === 'string' ? metadata.connection_id : null;
          })
          .filter((id): id is string => Boolean(id))
      );

      // Calculate totals
      const totalViews = profileViewsInEventCount || metricsData?.filter(m => m.metric_type === 'profile_view').length || 0;
      const totalConnections = uniqueConnectionIds.size > 0
        ? uniqueConnectionIds.size
        : Math.floor(connectionMetrics.length / 2);
      const totalLeadsFromSubs = Array.from(leadsByUser.values()).reduce((sum, v) => sum + v, 0);
      const totalLeads = totalLeadsFromSubs || metricsData?.filter(m => m.metric_type === 'lead_capture').length || 0;
      const totalMeetingRequests = meetingRequests?.length || 0;
      const totalMessages = messagesData.length;
      const totalScheduledMeetings = scheduledMeetings?.length || 0;

      // Build participant lookup by user_id -> role
      const participantRoleMap = new Map(participants?.map(p => [p.user_id, p.role]) || []);

      // Calculate metrics by role using direct table data
      const roleMetrics: Record<string, { views: number; clicks: number; leads: number; connections: number; meetingRequests: number; messages: number; scheduledMeetings: number }> = {
        participant: { views: 0, clicks: 0, leads: 0, connections: 0, meetingRequests: 0, messages: 0, scheduledMeetings: 0 },
        stand: { views: 0, clicks: 0, leads: 0, connections: 0, meetingRequests: 0, messages: 0, scheduledMeetings: 0 },
        organizer: { views: 0, clicks: 0, leads: 0, connections: 0, meetingRequests: 0, messages: 0, scheduledMeetings: 0 },
      };

      // Views by role from profile_views direct query
      profileViewsByUser.forEach((count, userId) => {
        const role = participantRoleMap.get(userId);
        if (role && roleMetrics[role]) roleMetrics[role].views += count;
      });

      // Clicks by role from profile_views direct query
      clicksByUser.forEach((count, userId) => {
        const role = participantRoleMap.get(userId);
        if (role && roleMetrics[role]) roleMetrics[role].clicks += count;
      });

      // Leads by role from contact_submissions direct query
      leadsByUser.forEach((count, userId) => {
        const role = participantRoleMap.get(userId);
        if (role && roleMetrics[role]) roleMetrics[role].leads += count;
      });

      // Connections from event_participant_metrics (already working)
      metricsData?.forEach((metric: any) => {
        const participant = participants?.find(p => p.user_id === metric.participant_id);
        if (participant && metric.metric_type === 'connection') {
          const metadata = metric.metadata as Record<string, any> | null;
          if (metadata?.connected_with) {
            roleMetrics[participant.role].connections++;
          }
        }
      });

      // Meeting requests by role (sender)
      meetingRequests?.forEach(mr => {
        const role = participantRoleMap.get(mr.sender_id);
        if (role && roleMetrics[role]) roleMetrics[role].meetingRequests++;
      });

      // Messages by role (sender)
      messagesData.forEach(msg => {
        const role = participantRoleMap.get(msg.sender_id);
        if (role && roleMetrics[role]) roleMetrics[role].messages++;
      });

      // Scheduled meetings by role (scheduled_by)
      scheduledMeetings?.forEach(sm => {
        const role = participantRoleMap.get(sm.scheduled_by);
        if (role && roleMetrics[role]) roleMetrics[role].scheduledMeetings++;
      });

      const participantMetrics = Object.entries(roleMetrics).map(([role, data]) => ({
        role: role as 'participant' | 'stand' | 'organizer',
        ...data,
      }));

      // Calculate live metrics (during event)
      const liveMetricsMap = new Map();

      const ensureUser = (userId: string) => {
        if (!liveMetricsMap.has(userId)) {
          const participant = participants?.find(p => p.user_id === userId);
          if (!participant) return false;
          const profile = profilesMap.get(userId);
          liveMetricsMap.set(userId, {
            user_id: userId,
            user_name: profile?.name || 'Unknown',
            role: participant.role,
            views_during_event: 0,
            clicks_during_event: 0,
            leads_during_event: 0,
            connections_during_event: 0,
            stand_visits_during_event: 0,
            meeting_requests_during_event: 0,
            messages_during_event: 0,
            scheduled_meetings_during_event: 0,
          });
        }
        return true;
      };

      // Populate live metrics from direct table data
      profileViewsByUser.forEach((count, userId) => {
        if (ensureUser(userId)) {
          const userMetrics = liveMetricsMap.get(userId);
          userMetrics.views_during_event += count;
          const viewedParticipant = participants?.find(p => p.user_id === userId);
          if (viewedParticipant?.role === 'stand') {
            userMetrics.stand_visits_during_event += count;
          }
        }
      });

      clicksByUser.forEach((count, userId) => {
        if (ensureUser(userId)) {
          liveMetricsMap.get(userId).clicks_during_event += count;
        }
      });

      leadsByUser.forEach((count, userId) => {
        if (ensureUser(userId)) {
          liveMetricsMap.get(userId).leads_during_event += count;
        }
      });

      // Connections from event_participant_metrics
      metricsData?.filter(m => m.is_during_event && m.metric_type === 'connection').forEach((metric: any) => {
        if (ensureUser(metric.participant_id)) {
          liveMetricsMap.get(metric.participant_id).connections_during_event++;
        }
      });

      // Meeting requests (count for sender)
      meetingRequests?.forEach(mr => {
        if (ensureUser(mr.sender_id)) liveMetricsMap.get(mr.sender_id).meeting_requests_during_event++;
      });

      // Messages (count for sender)
      messagesData.forEach(msg => {
        if (ensureUser(msg.sender_id)) liveMetricsMap.get(msg.sender_id).messages_during_event++;
      });

      // Scheduled meetings (count for scheduled_by)
      scheduledMeetings?.forEach(sm => {
        if (ensureUser(sm.scheduled_by)) liveMetricsMap.get(sm.scheduled_by).scheduled_meetings_during_event++;
      });

      setMetrics({
        totalParticipants: participantsCount || 0,
        totalViews,
        totalConnections,
        totalLeads,
        totalMeetingRequests,
        totalMessages,
        totalScheduledMeetings,
        participantMetrics,
        liveMetrics: Array.from(liveMetricsMap.values()),
      });
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    refreshMetrics: fetchMetrics,
  };
};
