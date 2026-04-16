import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportMessage {
  id: string;
  event_id: string;
  sender_id: string;
  content: string;
  is_organizer: boolean;
  read: boolean;
  created_at: string;
  sender_profile?: {
    id: string;
    name: string;
    photo_url?: string;
  };
}

export const useEventSupportChat = (eventId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('event_support_messages')
      .select('*')
      .eq('event_id', eventId)
      .eq('sender_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      // Also fetch messages where is_organizer=true addressed to this user
      // Organizer replies are visible to all participants via RLS
      console.error('Error loading support messages:', error);
      setLoading(false);
      return;
    }

    // Also fetch organizer replies (is_organizer = true)
    const { data: orgReplies } = await supabase
      .from('event_support_messages')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_organizer', true)
      .order('created_at', { ascending: true });

    // Merge and deduplicate
    const allMessages = [...(data || []), ...(orgReplies || [])];
    const uniqueMap = new Map(allMessages.map(m => [m.id, m]));
    const sorted = Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setMessages(sorted as SupportMessage[]);
    setLoading(false);
  }, [user, eventId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    const { error } = await supabase
      .from('event_support_messages')
      .insert({
        event_id: eventId,
        sender_id: user.id,
        content: content.trim(),
        is_organizer: false,
      });

    if (error) {
      console.error('Error sending support message:', error);
      return;
    }

    await loadMessages();
  }, [user, eventId, loadMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    loadMessages();

    const channel = supabase
      .channel(`support-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_support_messages',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, eventId, loadMessages]);

  return { messages, loading, sendMessage, loadMessages };
};

// Hook for organizers to see all support conversations
export const useEventSupportInbox = (eventId: string) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<{
    sender_id: string;
    sender_name: string;
    sender_photo?: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    message_count: number;
  }[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('event_support_messages')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading support inbox:', error);
      setLoading(false);
      return;
    }

    // Group by sender (non-organizer senders)
    const senderMap = new Map<string, typeof data>();
    (data || []).forEach(msg => {
      // Group by participant sender_id (skip organizer messages for grouping, but include in thread)
      const key = msg.is_organizer ? null : msg.sender_id;
      if (key) {
        if (!senderMap.has(key)) senderMap.set(key, []);
        senderMap.get(key)!.push(msg);
      }
    });

    // Get unique sender IDs
    const senderIds = Array.from(senderMap.keys());

    if (senderIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, photo_url')
      .in('id', senderIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const convos = senderIds.map(senderId => {
      const msgs = senderMap.get(senderId)!;
      const profile = profileMap.get(senderId);
      const unread = msgs.filter(m => !m.read && !m.is_organizer).length;

      return {
        sender_id: senderId,
        sender_name: profile?.name || 'Participante',
        sender_photo: profile?.photo_url || undefined,
        last_message: msgs[0]?.content || '',
        last_message_at: msgs[0]?.created_at || '',
        unread_count: unread,
        message_count: msgs.length,
      };
    }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    setConversations(convos);
    setLoading(false);
  }, [user, eventId]);

  const loadChatMessages = useCallback(async (participantId: string) => {
    if (!user) return;

    // Fetch all messages from this participant + organizer replies
    const { data, error } = await supabase
      .from('event_support_messages')
      .select('*')
      .eq('event_id', eventId)
      .or(`sender_id.eq.${participantId},is_organizer.eq.true`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading chat:', error);
      return;
    }

    // Fetch profiles for senders
    const senderIds = [...new Set((data || []).map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, photo_url')
      .in('id', senderIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const mapped = (data || []).map(m => ({
      ...m,
      sender_profile: profileMap.get(m.sender_id),
    })) as SupportMessage[];

    setChatMessages(mapped);
    setActiveChat(participantId);

    // Mark as read
    const unreadIds = (data || [])
      .filter(m => !m.read && !m.is_organizer)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('event_support_messages')
        .update({ read: true })
        .in('id', unreadIds);
    }
  }, [user, eventId]);

  const sendReply = useCallback(async (content: string) => {
    if (!user || !content.trim() || !activeChat) return;

    const { error } = await supabase
      .from('event_support_messages')
      .insert({
        event_id: eventId,
        sender_id: user.id,
        content: content.trim(),
        is_organizer: true,
      });

    if (error) {
      console.error('Error sending reply:', error);
      return;
    }

    await loadChatMessages(activeChat);
    await loadConversations();
  }, [user, eventId, activeChat, loadChatMessages, loadConversations]);

  useEffect(() => {
    if (!user) return;
    loadConversations();

    const channel = supabase
      .channel(`support-inbox-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_support_messages',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        loadConversations();
        if (activeChat) loadChatMessages(activeChat);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, eventId, activeChat, loadConversations, loadChatMessages]);

  return {
    conversations,
    chatMessages,
    activeChat,
    setActiveChat,
    loading,
    loadChatMessages,
    sendReply,
    loadConversations,
  };
};
