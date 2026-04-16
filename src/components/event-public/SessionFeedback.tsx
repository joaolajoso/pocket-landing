import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SessionFeedbackProps {
  eventId: string;
  sessionIndex: number;
}

const EMOJIS = ['😶', '😞', '😕', '😐', '🙂', '😄'];

const SessionFeedback = ({ eventId, sessionIndex }: SessionFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('event_session_feedback')
        .select('*')
        .eq('event_id', eventId)
        .eq('session_index', sessionIndex)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setRating((data as any).rating);
        setComment((data as any).comment || '');
        setExistingId((data as any).id);
      }
    };
    load();
  }, [user, eventId, sessionIndex]);

  const handleRate = async (value: number) => {
    if (!user) return;
    setRating(value);
    setSaving(true);
    try {
      if (existingId) {
        await supabase
          .from('event_session_feedback')
          .update({ rating: value, updated_at: new Date().toISOString() } as any)
          .eq('id', existingId);
      } else {
        const { data } = await supabase
          .from('event_session_feedback')
          .insert({
            event_id: eventId,
            session_index: sessionIndex,
            user_id: user.id,
            rating: value,
            comment: comment || null,
          } as any)
          .select()
          .single();
        if (data) setExistingId((data as any).id);
      }
    } catch (e) {
      console.error('Error saving feedback:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || rating === null) return;
    setSaving(true);
    try {
      if (existingId) {
        await supabase
          .from('event_session_feedback')
          .update({ comment: comment || null, updated_at: new Date().toISOString() } as any)
          .eq('id', existingId);
      } else {
        const { data } = await supabase
          .from('event_session_feedback')
          .insert({
            event_id: eventId,
            session_index: sessionIndex,
            user_id: user.id,
            rating,
            comment: comment || null,
          } as any)
          .select()
          .single();
        if (data) setExistingId((data as any).id);
      }
      toast({ title: 'Feedback enviado', description: 'Obrigado pela sua avaliação!' });
      setShowComment(false);
    } catch (e) {
      console.error('Error saving comment:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      {/* Emoji rating row */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Avaliar:</span>
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => handleRate(i)}
            disabled={saving}
            className={cn(
              'text-xl p-1 rounded-md transition-all hover:scale-125',
              rating === i
                ? 'scale-125 bg-primary/10 ring-1 ring-primary/30'
                : 'opacity-50 hover:opacity-100'
            )}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Comment toggle */}
      {rating !== null && (
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showComment ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {comment ? 'Editar comentário' : 'Adicionar comentário'}
        </button>
      )}

      {showComment && (
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Deixe o seu comentário..."
            rows={2}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={saving}
            className="gap-1.5"
          >
            <Send className="h-3 w-3" />
            Enviar
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionFeedback;
