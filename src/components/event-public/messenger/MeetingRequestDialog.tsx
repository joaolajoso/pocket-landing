import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface MeetingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: {
    user_id: string;
    profile: {
      name: string;
      photo_url?: string;
      job_title?: string;
    };
  };
  onSend: (receiverId: string, message: string) => Promise<string | null>;
}

const MeetingRequestDialog = ({ open, onOpenChange, participant, onSend }: MeetingRequestDialogProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Escreva uma mensagem');
      return;
    }

    setSending(true);
    const result = await onSend(participant.user_id, message.trim());
    setSending(false);

    if (result) {
      toast.success('Pedido de meeting enviado!');
      setMessage('');
      onOpenChange(false);
    } else {
      toast.error('Erro ao enviar pedido');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Pedir Meeting
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.profile?.photo_url} />
              <AvatarFallback>{participant.profile?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{participant.profile?.name}</p>
              <p className="text-xs text-muted-foreground">{participant.profile?.job_title}</p>
            </div>
          </div>

          <Textarea
            placeholder="Olá! Gostava de marcar uma conversa sobre..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <Button 
            className="w-full" 
            onClick={handleSend} 
            disabled={sending || !message.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'A enviar...' : 'Enviar pedido'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingRequestDialog;
