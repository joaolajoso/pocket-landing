import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface StandReviewCardProps {
  clarityScore: number;
  fitScore: number;
  motivationScore: number;
  candidateName?: string;
}

const SCORE_EMOJIS = ['😶', '😕', '🙂', '😊', '😃', '🤩'];

const LABELS = [
  { key: 'clarity', short: 'Clareza do pitch' },
  { key: 'fit', short: 'Adequação do perfil' },
  { key: 'motivation', short: 'Motivação e energia' },
];

const StandReviewCard = ({ clarityScore, fitScore, motivationScore, candidateName }: StandReviewCardProps) => {
  const scores = [clarityScore, fitScore, motivationScore];
  const total = scores.reduce((a, b) => a + b, 0);
  const avg = (total / 3).toFixed(1);

  return (
    <Card className="border-primary/20 bg-primary/5 max-w-[85%] mx-auto">
      <CardHeader className="pb-1.5 pt-2.5 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
          <Star className="h-3.5 w-3.5" />
          Avaliação do Pitch {candidateName ? `de ${candidateName}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 space-y-1.5">
        {LABELS.map(({ key, short }, i) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground truncate">{short}</span>
            <div className="flex items-center gap-1">
              <span className="text-base">{SCORE_EMOJIS[scores[i]]}</span>
              <span className="text-xs font-medium w-4 text-right">{scores[i]}</span>
              <span className="text-[10px] text-muted-foreground">/5</span>
            </div>
          </div>
        ))}
        <div className="border-t pt-1.5 mt-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">Média</span>
          <span className="text-sm font-bold text-primary">{avg}/5</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandReviewCard;
