import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MeetingRequest {
  id: string;
  event_id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  created_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    name: string;
    photo_url?: string;
    job_title?: string;
  };
  last_message?: EventMessage;
  unread_count?: number;
}

export interface EventMessage {
  id: string;
  meeting_request_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export const useEventMessenger = (eventId: string) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MeetingRequest[]>([]);
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  // Load all conversations for this event
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('event_meeting_requests')
        .select('*')
        .eq('event_id', eventId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const otherUserIds = (data || []).map((r: any) =>
        r.sender_id === user.id ? r.receiver_id : r.sender_id
      );

      // Fetch profiles and last messages in parallel
      const [profilesRes, messagesRes] = await Promise.all([
        otherUserIds.length > 0
          ? supabase
              .from('profiles')
              .select('id, name, photo_url, job_title')
              .in('id', otherUserIds)
          : Promise.resolve({ data: [] }),
        supabase
          .from('event_messages')
          .select('*')
          .in('meeting_request_id', (data || []).map((r: any) => r.id))
          .order('created_at', { ascending: false })
      ]);

      const profilesMap = new Map(
        (profilesRes.data || []).map((p: any) => [p.id, p])
      );

      // Group messages by conversation, get last and unread count
      const lastMessageMap = new Map<string, EventMessage>();
      const unreadMap = new Map<string, number>();
      
      (messagesRes.data || []).forEach((msg: any) => {
        if (!lastMessageMap.has(msg.meeting_request_id)) {
          lastMessageMap.set(msg.meeting_request_id, msg);
        }
        if (!msg.read && msg.sender_id !== user.id) {
          unreadMap.set(msg.meeting_request_id, (unreadMap.get(msg.meeting_request_id) || 0) + 1);
        }
      });

      const mapped: MeetingRequest[] = (data || []).map((r: any) => {
        const otherId = r.sender_id === user.id ? r.receiver_id : r.sender_id;
        return {
          ...r,
          other_user: profilesMap.get(otherId),
          last_message: lastMessageMap.get(r.id),
          unread_count: unreadMap.get(r.id) || 0
        };
      });

      setConversations(mapped);
      setTotalUnread(mapped.reduce((acc, c) => acc + (c.unread_count || 0), 0));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (meetingRequestId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('event_messages')
      .select('*')
      .eq('meeting_request_id', meetingRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);

    // Mark unread messages as read
    const unreadIds = (data || [])
      .filter((m: any) => !m.read && m.sender_id !== user.id)
      .map((m: any) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('event_messages')
        .update({ read: true })
        .in('id', unreadIds);
    }
  }, [user]);

  // Send a meeting request
  const sendMeetingRequest = useCallback(async (receiverId: string, message: string) => {
    if (!user) return null;

    // Check if request already exists
    const { data: existing } = await supabase
      .from('event_meeting_requests')
      .select('id')
      .eq('event_id', eventId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      // Open existing conversation
      setActiveConversation(existing.id);
      await loadMessages(existing.id);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('event_meeting_requests')
      .insert({
        event_id: eventId,
        sender_id: user.id,
        receiver_id: receiverId,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending meeting request:', error);
      return null;
    }

    // Send initial message
    if (message) {
      await supabase.from('event_messages').insert({
        meeting_request_id: data.id,
        sender_id: user.id,
        content: message
      });
    }

    await loadConversations();
    setActiveConversation(data.id);
    return data.id;
  }, [user, eventId, loadConversations, loadMessages]);

  // Send a message
  const sendMessage = useCallback(async (meetingRequestId: string, content: string) => {
    if (!user || !content.trim()) return;

    const { error } = await supabase.from('event_messages').insert({
      meeting_request_id: meetingRequestId,
      sender_id: user.id,
      content: content.trim()
    });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    // Update the meeting request updated_at
    await supabase
      .from('event_meeting_requests')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', meetingRequestId);
  }, [user]);

  // Update meeting request status
  const updateRequestStatus = useCallback(async (requestId: string, status: 'accepted' | 'declined' | 'cancelled') => {
    if (!user) return;

    await supabase
      .from('event_meeting_requests')
      .update({ status })
      .eq('id', requestId);

    await loadConversations();
  }, [user, loadConversations]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    loadConversations();

    const messagesChannel = supabase
      .channel('event-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_messages'
      }, (payload) => {
        const newMsg = payload.new as EventMessage;
        // If viewing this conversation, add message
        if (activeConversation && newMsg.meeting_request_id === activeConversation) {
          setMessages(prev => [...prev, newMsg]);
          // Mark as read if from other user
          if (newMsg.sender_id !== user.id) {
            supabase.from('event_messages').update({ read: true }).eq('id', newMsg.id);
          }
        }
        loadConversations();
      })
      .subscribe();

    const requestsChannel = supabase
      .channel('event-meeting-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_meeting_requests',
        filter: `event_id=eq.${eventId}`
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user, eventId, activeConversation, loadConversations]);

  return {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    totalUnread,
    loadMessages,
    sendMeetingRequest,
    sendMessage,
    updateRequestStatus,
    loadConversations
  };
};
