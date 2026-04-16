import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Trash2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

interface EventAnnouncementsSectionProps {
  eventId: string;
}

export const EventAnnouncementsSection = ({ eventId }: EventAnnouncementsSectionProps) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('event_announcements')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [eventId]);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim() || !user) return;
    setSending(true);

    const { error } = await supabase.from('event_announcements').insert({
      event_id: eventId,
      title: title.trim(),
      message: message.trim(),
      created_by: user.id,
    });

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível criar o aviso.', variant: 'destructive' });
    } else {
      toast({ title: 'Aviso enviado', description: 'O aviso foi publicado com sucesso.' });
      setTitle('');
      setMessage('');
      setDialogOpen(false);
      fetchAnnouncements();
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('event_announcements').delete().eq('id', id);
    if (!error) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Aviso removido' });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('event_announcements')
      .update({ is_active: !currentActive })
      .eq('id', id);
    if (!error) {
      setAnnouncements(prev =>
        prev.map(a => (a.id === id ? { ...a, is_active: !currentActive } : a))
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Avisos
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Aviso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Título do aviso"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Mensagem do aviso..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
              />
              <Button onClick={handleCreate} disabled={sending || !title.trim() || !message.trim()} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Publicar Aviso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum aviso publicado ainda.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div
                key={a.id}
                className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition-opacity ${
                  !a.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{a.title}</p>
                    {!a.is_active && (
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(a.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(a.id, a.is_active)}
                  >
                    {a.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
