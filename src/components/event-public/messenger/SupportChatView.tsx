import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useEventSupportChat } from '@/hooks/network/useEventSupportChat';

interface SupportChatViewProps {
  eventId: string;
  onBack: () => void;
}

const SupportChatView = ({ eventId, onBack }: SupportChatViewProps) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useEventSupportChat(eventId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await sendMessage(newMessage);
    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Headphones className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">Linha de Apoio</p>
          <p className="text-[11px] text-muted-foreground truncate">Organização do evento</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Headphones className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Envie uma mensagem para a organização do evento.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id && !msg.is_organizer;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                isMe
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              }`}>
                {msg.is_organizer && (
                  <p className={`text-[10px] font-medium mb-0.5 ${isMe ? 'text-primary-foreground/70' : 'text-primary'}`}>
                    Organização
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {format(new Date(msg.created_at), 'HH:mm', { locale: pt })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t shrink-0">
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
    </div>
  );
};

export default SupportChatView;
