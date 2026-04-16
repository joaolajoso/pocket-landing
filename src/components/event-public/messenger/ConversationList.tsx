import { MeetingRequest } from '@/hooks/network/useEventMessenger';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Check, X, Headphones } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ConversationListProps {
  conversations: MeetingRequest[];
  onSelect: (id: string) => void;
  onBack: () => void;
  onOpenSupport: () => void;
  eventId?: string;
}

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600' },
  accepted: { label: 'Aceite', icon: Check, className: 'bg-green-500/10 text-green-600' },
  declined: { label: 'Recusado', icon: X, className: 'bg-destructive/10 text-destructive' },
  cancelled: { label: 'Cancelado', icon: X, className: 'bg-muted text-muted-foreground' }
};

const ConversationList = ({ conversations, onSelect, onBack, onOpenSupport, eventId }: ConversationListProps) => {
  return (
    <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">Mensagens</h3>
        {conversations.length > 0 && (
          <Badge variant="secondary" className="text-xs">{conversations.length}</Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Linha de apoio - always visible */}
        <button
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
          onClick={onOpenSupport}
        >
          <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Linha de apoio</p>
            <p className="text-xs text-muted-foreground truncate">
              Fale com a organização do evento
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary shrink-0">
            Suporte
          </Badge>
        </button>

        {conversations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Ainda não tem conversas de networking.
          </div>
        ) : (
          conversations.map((conv) => {
            const status = statusConfig[conv.status];
            const StatusIcon = status.icon;
            
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              >
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={conv.other_user?.photo_url} />
                    <AvatarFallback>{conv.other_user?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  {(conv.unread_count || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{conv.other_user?.name || 'Utilizador'}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: pt })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.last_message?.content || conv.message || 'Sem mensagens'}
                  </p>
                  <div className="mt-1">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.className}`}>
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
