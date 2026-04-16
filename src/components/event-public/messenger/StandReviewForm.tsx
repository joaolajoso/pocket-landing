import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface StandReviewFormProps {
  meetingRequestId: string;
  eventId: string;
  candidateUserId: string;
  candidateName?: string;
  onSubmitted?: (scores: { clarity_score: number; fit_score: number; motivation_score: number }) => void;
}

const SCORE_EMOJIS = ['😶', '😕', '🙂', '😊', '😃', '🤩'];

const QUESTIONS = [
  {
    key: 'clarity',
    label: 'O pitch do(a) candidato(a) comunica de forma clara quem ele(a) é e o seu percurso profissional?',
  },
  {
    key: 'fit',
    label: 'O pitch demonstra adequação do perfil do(a) candidato(a) às vagas e necessidades atuais da empresa?',
  },
  {
    key: 'motivation',
    label: 'O pitch transmite motivação, energia e potencial de impacto positivo na equipa/organização?',
  },
];

const StandReviewForm = ({ meetingRequestId, eventId, candidateUserId, candidateName, onSubmitted }: StandReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<Record<string, number | null>>({
    clarity: null,
    fit: null,
    motivation: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      const { data } = await supabase
        .from('stand_reviews')
        .select('id')
        .eq('meeting_request_id', meetingRequestId)
        .maybeSingle();
      
      if (data) {
        setExistingReview(true);
        setSubmitted(true);
      }
    };
    checkExisting();
  }, [meetingRequestId]);

  const handleSubmit = async () => {
    if (!user) return;
    if (scores.clarity === null || scores.fit === null || scores.motivation === null) {
      toast({
        title: 'Avaliação incompleta',
        description: 'Por favor, avalie todas as questões.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get stand info
      const { data: stand } = await supabase
        .from('event_stands')
        .select('id')
        .eq('assigned_user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (!stand) {
        toast({ title: 'Erro', description: 'Stand não encontrado.', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('stand_reviews').insert({
        event_id: eventId,
        stand_id: stand.id,
        reviewer_user_id: user.id,
        candidate_user_id: candidateUserId,
        meeting_request_id: meetingRequestId,
        clarity_score: scores.clarity,
        fit_score: scores.fit,
        motivation_score: scores.motivation,
      });

      if (error) throw error;

      setSubmitted(true);
      onSubmitted?.({ clarity_score: scores.clarity!, fit_score: scores.fit!, motivation_score: scores.motivation! });
      toast({ title: 'Review enviada!', description: 'Obrigado pela sua avaliação.' });
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted || existingReview) {
    return null; // Review card is shown separately via ChatView
  }

  return (
    <Card className="border-primary/30 bg-card/80">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Star className="h-4 w-4 text-primary" />
          Avaliar Pitch {candidateName ? `de ${candidateName}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {QUESTIONS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
            <div className="flex gap-1">
              {SCORE_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setScores(prev => ({ ...prev, [key]: index }))}
                  className={`
                    w-9 h-9 rounded-lg text-lg transition-all
                    ${scores[key] === index
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'bg-muted hover:bg-muted/80 hover:scale-105'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button
          onClick={handleSubmit}
          disabled={submitting || scores.clarity === null || scores.fit === null || scores.motivation === null}
          size="sm"
          className="w-full mt-2"
        >
          {submitting ? 'A enviar...' : 'Enviar Review'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StandReviewForm;
