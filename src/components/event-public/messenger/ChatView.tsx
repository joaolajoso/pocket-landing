import { useState, useRef, useEffect } from 'react';
import { MeetingRequest, EventMessage } from '@/hooks/network/useEventMessenger';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Check, X, Clock, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import ScheduleMeetingDialog from './ScheduleMeetingDialog';
import StandReviewForm from './StandReviewForm';
import StandReviewCard from './StandReviewCard';
import { supabase } from '@/integrations/supabase/client';

interface ChatViewProps {
  conversation: MeetingRequest;
  messages: EventMessage[];
  eventId: string;
  onBack: () => void;
  onSendMessage: (meetingRequestId: string, content: string) => Promise<void>;
  onUpdateStatus: (requestId: string, status: 'accepted' | 'declined' | 'cancelled') => Promise<void>;
}

const ChatView = ({ conversation, messages, eventId, onBack, onSendMessage, onUpdateStatus }: ChatViewProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<{ clarity_score: number; fit_score: number; motivation_score: number; created_at?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load review data for both parties + check if stand user should see review form
  useEffect(() => {
    const loadReviewAndCheckForm = async () => {
      if (!user) return;

      // Always load existing review for both parties
      const { data: review } = await supabase
        .from('stand_reviews')
        .select('clarity_score, fit_score, motivation_score, created_at')
        .eq('meeting_request_id', conversation.id)
        .maybeSingle();

      if (review) {
        setReviewData(review);
        return; // Review exists, no need to show form
      }
      
      // Check if current user is a stand with send_review enabled
      const { data: stand } = await supabase
        .from('event_stands')
        .select('id, send_review')
        .eq('assigned_user_id', user.id)
        .eq('event_id', eventId)
        .eq('send_review', true)
        .maybeSingle();

      if (stand) {
        const otherUserId = conversation.sender_id === user.id ? conversation.receiver_id : conversation.sender_id;
        const { data: otherStand } = await supabase
          .from('event_stands')
          .select('id')
          .eq('assigned_user_id', otherUserId)
          .eq('event_id', eventId)
          .maybeSingle();
        
        if (!otherStand) {
          setShowReviewForm(true);
        }
      }
    };
    loadReviewAndCheckForm();
  }, [user, eventId, conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await onSendMessage(conversation.id, newMessage);
    setNewMessage('');
    setSending(false);
  };

  const isReceiver = conversation.receiver_id === user?.id;
  const isPending = conversation.status === 'pending';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.other_user?.photo_url} />
          <AvatarFallback>{conversation.other_user?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{conversation.other_user?.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{conversation.other_user?.job_title}</p>
        </div>
        <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
          {conversation.status === 'pending' && <Clock className="h-2.5 w-2.5 mr-1" />}
          {conversation.status === 'accepted' && <Check className="h-2.5 w-2.5 mr-1" />}
          {conversation.status === 'declined' && <X className="h-2.5 w-2.5 mr-1" />}
          {conversation.status === 'pending' ? 'Pendente' : conversation.status === 'accepted' ? 'Aceite' : conversation.status === 'declined' ? 'Recusado' : 'Cancelado'}
        </Badge>
      </div>

      {/* Accept/Decline bar for receiver */}
      {isPending && isReceiver && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg my-2">
          <span className="text-xs text-muted-foreground flex-1">Pedido de meeting</span>
          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(conversation.id, 'declined')} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" /> Recusar
          </Button>
          <Button size="sm" onClick={() => onUpdateStatus(conversation.id, 'accepted')} className="h-7 text-xs">
            <Check className="h-3 w-3 mr-1" /> Aceitar
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">Sem mensagens ainda</p>
        )}
        {(() => {
          // Build a combined timeline of messages + review
          const items: Array<{ type: 'message'; data: EventMessage } | { type: 'review' } | { type: 'review-form' }> = 
            messages.map(msg => ({ type: 'message' as const, data: msg }));

          // Insert review card chronologically
          if (reviewData?.created_at) {
            const reviewTime = new Date(reviewData.created_at).getTime();
            const insertIndex = items.findIndex(item => 
              item.type === 'message' && new Date(item.data.created_at).getTime() > reviewTime
            );
            if (insertIndex === -1) {
              items.push({ type: 'review' });
            } else {
              items.splice(insertIndex, 0, { type: 'review' });
            }
          } else if (reviewData) {
            items.push({ type: 'review' });
          }

          // Add review form at end if needed
          if (showReviewForm && !reviewData) {
            items.push({ type: 'review-form' });
          }

          return items.map((item, index) => {
            if (item.type === 'review') {
              return (
                <div key="review" className="py-2">
                  <StandReviewCard
                    clarityScore={reviewData!.clarity_score}
                    fitScore={reviewData!.fit_score}
                    motivationScore={reviewData!.motivation_score}
                    candidateName={conversation.other_user?.name}
                  />
                </div>
              );
            }
            if (item.type === 'review-form') {
              return (
                <div key="review-form" className="py-2">
                  <StandReviewForm
                    meetingRequestId={conversation.id}
                    eventId={eventId}
                    candidateUserId={conversation.sender_id === user?.id ? conversation.receiver_id : conversation.sender_id}
                    candidateName={conversation.other_user?.name}
                    onSubmitted={(scores) => {
                      setReviewData({ ...scores, created_at: new Date().toISOString() });
                      setShowReviewForm(false);
                    }}
                  />
                </div>
              );
            }
            const msg = item.data;
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  isMe 
                    ? 'bg-primary text-primary-foreground rounded-br-md' 
                    : 'bg-muted rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {format(new Date(msg.created_at), 'HH:mm', { locale: pt })}
                  </p>
                </div>
              </div>
            );
          });
        })()}
        <div ref={messagesEndRef} />
      </div>

      {/* Schedule meeting button for accepted requests */}
      {conversation.status === 'accepted' && (
        <div className="flex items-center gap-2 py-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowSchedule(true)}
          >
            <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
            Marcar Meeting
          </Button>
        </div>
      )}

      {/* Input */}
      {conversation.status !== 'declined' && conversation.status !== 'cancelled' && (
        <div className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="Escreva uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ScheduleMeetingDialog
        open={showSchedule}
        onOpenChange={setShowSchedule}
        meetingRequestId={conversation.id}
        eventId={eventId}
        otherUserName={conversation.other_user?.name}
      />
    </div>
  );
};

export default ChatView;
