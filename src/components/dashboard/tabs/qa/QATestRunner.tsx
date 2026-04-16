import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface QATestRunnerProps {
  isRunning: boolean;
  progress: { current: number; total: number; currentTest: string };
}

const QATestRunner = ({ isRunning, progress }: QATestRunnerProps) => {
  if (!isRunning) return null;

  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">A executar testes...</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{progress.current}/{progress.total}</span>
      </div>
      <Progress value={pct} className="h-2" />
      {progress.currentTest && (
        <p className="text-xs text-muted-foreground truncate">→ {progress.currentTest}</p>
      )}
    </div>
  );
};

export default QATestRunner;
