import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Moon, Send, Star, User, ArrowLeft, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useEventSupportInbox } from '@/hooks/network/useEventSupportChat';

interface EventFeedbackTabProps {
  eventId: string;
}

const EMOJIS = ['😶', '😞', '😕', '😐', '🙂', '😄'];

const SessionsFeedbackSection = ({ eventId }: { eventId: string }) => {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['event-session-feedback', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_session_feedback')
        .select('*')
        .eq('event_id', eventId)
        .order('session_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: timelineContent } = useQuery({
    queryKey: ['event-timeline-content', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_custom_content')
        .select('*')
        .eq('event_id', eventId)
        .eq('section_type', 'timeline')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const userIds = [...new Set(feedback?.map(f => f.user_id) || [])];
  const { data: profiles } = useQuery({
    queryKey: ['feedback-profiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);
      if (error) throw error;
      return data;
    },
    enabled: userIds.length > 0,
  });

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
  const timelineItems: any[] = (timelineContent?.content as any)?.items || [];

  const groupedFeedback = feedback?.reduce((acc, fb) => {
    if (!acc[fb.session_index]) acc[fb.session_index] = [];
    acc[fb.session_index].push(fb);
    return acc;
  }, {} as Record<number, typeof feedback>) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!feedback || feedback.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Ainda não há feedback de sessões.</p>
          <p className="text-xs mt-1">O feedback aparece aqui quando os participantes avaliam sessões finalizadas.</p>
        </CardContent>
      </Card>
    );
  }

  const sessionIndices = Object.keys(groupedFeedback).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {sessionIndices.map((sessionIndex) => {
        const sessionFeedbacks = groupedFeedback[sessionIndex];
        const sessionItem = timelineItems[sessionIndex];
        const sessionTitle = sessionItem?.title || `Sessão ${sessionIndex + 1}`;
        const avgRating = sessionFeedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / sessionFeedbacks.length;
        const commentsCount = sessionFeedbacks.filter((f: any) => f.comment).length;

        return (
          <Card key={sessionIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{sessionTitle}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <User className="h-3 w-3" />
                    {sessionFeedbacks.length}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Star className="h-3 w-3" />
                    {avgRating.toFixed(1)}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs">
                {commentsCount} comentário{commentsCount !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {EMOJIS.map((emoji, i) => {
                  const count = sessionFeedbacks.filter((f: any) => f.rating === i).length;
                  const pct = sessionFeedbacks.length > 0 ? (count / sessionFeedbacks.length) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-lg">{emoji}</span>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
              {commentsCount > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">Comentários</p>
                  {sessionFeedbacks
                    .filter((f: any) => f.comment)
                    .map((f: any) => {
                      const profile = profileMap.get(f.user_id);
                      return (
                        <div key={f.id} className="flex gap-2 items-start">
                          <span className="text-sm">{EMOJIS[f.rating]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{profile?.name || 'Anónimo'}</p>
                            <p className="text-xs text-muted-foreground">{f.comment}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              {format(new Date(f.created_at), "d MMM, HH:mm", { locale: pt })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Organizer support inbox
const SupportInboxSection = ({ eventId }: { eventId: string }) => {
  const {
    conversations,
    chatMessages,
    activeChat,
    setActiveChat,
    loading,
    loadChatMessages,
    sendReply,
  } = useEventSupportInbox(eventId);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    await sendReply(reply);
    setReply('');
    setSending(false);
  };

  if (activeChat) {
    const activeConvo = conversations.find(c => c.sender_id === activeChat);
    return (
      <Card className="flex flex-col" style={{ minHeight: '400px' }}>
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveChat(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeConvo?.sender_photo} />
              <AvatarFallback>{activeConvo?.sender_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">{activeConvo?.sender_name}</CardTitle>
              <CardDescription className="text-[10px]">Linha de apoio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 pb-3">
          <div className="flex-1 overflow-y-auto space-y-2 py-2" style={{ maxHeight: '300px' }}>
            {chatMessages.map((msg) => {
              const isOrg = msg.is_organizer;
              return (
                <div key={msg.id} className={`flex ${isOrg ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    isOrg
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-0.5 ${isOrg ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {format(new Date(msg.created_at), 'HH:mm', { locale: pt })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 pt-2 border-t shrink-0">
            <Input
              placeholder="Responder..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendReply} disabled={sending || !reply.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Headphones className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma mensagem de suporte.</p>
          <p className="text-xs mt-1">As mensagens dos participantes aparecerão aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <button
          key={conv.sender_id}
          onClick={() => loadChatMessages(conv.sender_id)}
          className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conv.sender_photo} />
              <AvatarFallback>{conv.sender_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            {conv.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {conv.unread_count}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm truncate">{conv.sender_name}</p>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: pt })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {conv.message_count}
          </Badge>
        </button>
      ))}
    </div>
  );
};

const ComingSoonSection = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card>
    <CardContent className="py-12 text-center text-muted-foreground">
      <Icon className="h-10 w-10 mx-auto mb-3 opacity-40" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs mt-1">{description}</p>
      <Badge variant="outline" className="mt-3 text-[10px]">Em breve</Badge>
    </CardContent>
  </Card>
);

const EventFeedbackTab = ({ eventId }: EventFeedbackTabProps) => {
  const [activeSection, setActiveSection] = useState('sessions');

  return (
    <div className="space-y-4">
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="w-full grid grid-cols-4 h-auto">
          <TabsTrigger value="sessions" className="flex flex-col gap-1 py-2 text-xs">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Sessões</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex flex-col gap-1 py-2 text-xs">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Apoio</span>
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex flex-col gap-1 py-2 text-xs">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Fecho do dia</span>
          </TabsTrigger>
          <TabsTrigger value="followup" className="flex flex-col gap-1 py-2 text-xs">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Follow-up</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <SessionsFeedbackSection eventId={eventId} />
        </TabsContent>

        <TabsContent value="support" className="mt-4">
          <SupportInboxSection eventId={eventId} />
        </TabsContent>

        <TabsContent value="daily" className="mt-4">
          <ComingSoonSection
            icon={Moon}
            title="Fecho do Dia"
            description="Envie um formulário rápido no final de cada dia do evento."
          />
        </TabsContent>

        <TabsContent value="followup" className="mt-4">
          <ComingSoonSection
            icon={Send}
            title="Follow-up"
            description="Formulário de avaliação final enviado após o término do evento."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventFeedbackTab;
