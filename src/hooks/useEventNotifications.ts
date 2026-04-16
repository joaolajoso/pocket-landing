import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const EVENT_NOTIF_SEEN_KEY = 'event_notifications_last_seen';
const EVENT_FIRST_JOIN_KEY = 'event_first_join_seen';

export interface EventNotificationItem {
  id: string;
  type: 'message' | 'meeting_request' | 'announcement' | 'match_alert' | 'welcome';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  metadata?: {
    senderId?: string;
    senderName?: string;
    senderPhoto?: string;
    requestId?: string;
    status?: string;
    eventTitle?: string;
  };
}

interface ActiveEventInfo {
  eventId: string;
  eventTitle: string;
  role: string;
}

export const useEventNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EventNotificationItem[]>([]);
  const [activeEvent, setActiveEvent] = useState<ActiveEventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSeenTime, setLastSeenTime] = useState<Date>(() => {
    const stored = localStorage.getItem(EVENT_NOTIF_SEEN_KEY);
    return stored ? new Date(stored) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  });

  const isDashboard = window.location.pathname.startsWith('/dashboard');

  const fetchEventNotifications = useCallback(async () => {
    if (!user || !isDashboard) {
      setLoading(false);
      return;
    }

    try {
      // 1. Find active event for the user
      const now = new Date().toISOString();
      const { data: participation } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          role,
          created_at,
          events!inner(title, event_date, end_date)
        `)
        .eq('user_id', user.id)
        .lte('events.event_date', now)
        .or(`events.end_date.gte.${now},events.end_date.is.null`)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (!participation) {
        setActiveEvent(null);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const eventId = participation.event_id;
      const eventTitle = (participation.events as any)?.title || 'Evento';
      const userRole = participation.role;

      setActiveEvent({ eventId, eventTitle, role: userRole });

      const items: EventNotificationItem[] = [];
      const sinceISO = lastSeenTime.toISOString();

      // 2. Check first-time join
      const joinKey = `${EVENT_FIRST_JOIN_KEY}_${eventId}`;
      const hasSeenWelcome = localStorage.getItem(joinKey);
      if (!hasSeenWelcome) {
        items.push({
          id: `welcome-${eventId}`,
          type: 'welcome',
          title: `Bem-vindo ao ${eventTitle}! 🎉`,
          description: 'Explore o evento, veja o programa e faça networking com outros participantes.',
          timestamp: participation.created_at,
          read: false,
        });
      }

      // 3. Fetch meeting requests (received, since last seen)
      const [requestsRes, messagesRes, announcementsRes] = await Promise.all([
        supabase
          .from('event_meeting_requests')
          .select('id, sender_id, status, message, created_at, updated_at')
          .eq('event_id', eventId)
          .eq('receiver_id', user.id)
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: false }),

        // 4. Unread messages
        supabase
          .from('event_messages')
          .select(`
            id, sender_id, content, read, created_at,
            meeting_request_id
          `)
          .eq('read', false)
          .neq('sender_id', user.id)
          .order('created_at', { ascending: false }),

        // 5. Active announcements
        supabase
          .from('event_announcements')
          .select('id, title, message, created_at')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: false }),
      ]);

      // Filter messages to only those from this event's conversations
      const { data: userRequests } = await supabase
        .from('event_meeting_requests')
        .select('id, sender_id, receiver_id')
        .eq('event_id', eventId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const requestIds = new Set((userRequests || []).map(r => r.id));
      const requestUserMap = new Map((userRequests || []).map(r => [
        r.id,
        r.sender_id === user.id ? r.receiver_id : r.sender_id
      ]));

      const eventMessages = (messagesRes.data || []).filter(
        m => requestIds.has(m.meeting_request_id)
      );

      // Collect all user IDs we need profiles for
      const profileIds = new Set<string>();
      (requestsRes.data || []).forEach(r => profileIds.add(r.sender_id));
      eventMessages.forEach(m => profileIds.add(m.sender_id));

      // Fetch profiles
      let profilesMap = new Map<string, any>();
      if (profileIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .in('id', Array.from(profileIds));
        profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      }

      // Process meeting requests
      (requestsRes.data || []).forEach(req => {
        const sender = profilesMap.get(req.sender_id);
        const statusLabel = req.status === 'pending' ? 'Novo pedido' :
          req.status === 'accepted' ? 'Pedido aceite' :
          req.status === 'declined' ? 'Pedido recusado' : req.status;

        items.push({
          id: `request-${req.id}`,
          type: 'meeting_request',
          title: `${statusLabel} de meeting`,
          description: sender?.name
            ? `${sender.name} quer reunir consigo`
            : req.message || 'Novo pedido de reunião',
          timestamp: req.created_at,
          read: false,
          metadata: {
            senderId: req.sender_id,
            senderName: sender?.name,
            senderPhoto: sender?.photo_url,
            requestId: req.id,
            status: req.status,
          },
        });
      });

      // Process unread messages (group by conversation, show latest)
      const seenConversations = new Set<string>();
      eventMessages.forEach(msg => {
        if (seenConversations.has(msg.meeting_request_id)) return;
        seenConversations.add(msg.meeting_request_id);

        const sender = profilesMap.get(msg.sender_id);
        const unreadCount = eventMessages.filter(
          m => m.meeting_request_id === msg.meeting_request_id
        ).length;

        items.push({
          id: `msg-${msg.id}`,
          type: 'message',
          title: sender?.name || 'Nova mensagem',
          description: unreadCount > 1
            ? `${unreadCount} mensagens não lidas`
            : msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : ''),
          timestamp: msg.created_at,
          read: false,
          metadata: {
            senderId: msg.sender_id,
            senderName: sender?.name,
            senderPhoto: sender?.photo_url,
            requestId: msg.meeting_request_id,
          },
        });
      });

      // Process announcements
      (announcementsRes.data || []).forEach(ann => {
        items.push({
          id: `ann-${ann.id}`,
          type: 'announcement',
          title: ann.title,
          description: ann.message.substring(0, 100) + (ann.message.length > 100 ? '...' : ''),
          timestamp: ann.created_at,
          read: false,
        });
      });

      // Sort by timestamp descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(items);
    } catch (error) {
      console.error('Error fetching event notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isDashboard, lastSeenTime]);

  useEffect(() => {
    fetchEventNotifications();
  }, [fetchEventNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !isDashboard || !activeEvent) return;

    const channel = supabase
      .channel('event-notifs-sidebar')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_messages',
      }, () => fetchEventNotifications())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_meeting_requests',
        filter: `event_id=eq.${activeEvent.eventId}`,
      }, () => fetchEventNotifications())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_announcements',
        filter: `event_id=eq.${activeEvent.eventId}`,
      }, () => fetchEventNotifications())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDashboard, activeEvent, fetchEventNotifications]);

  const markEventNotificationsRead = () => {
    const now = new Date();
    setLastSeenTime(now);
    localStorage.setItem(EVENT_NOTIF_SEEN_KEY, now.toISOString());

    // Mark welcome as seen
    if (activeEvent) {
      localStorage.setItem(`${EVENT_FIRST_JOIN_KEY}_${activeEvent.eventId}`, 'true');
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const totalEventNotifications = notifications.filter(n => !n.read).length;

  return {
    notifications,
    activeEvent,
    loading,
    totalEventNotifications,
    markEventNotificationsRead,
    refetch: fetchEventNotifications,
  };
};
