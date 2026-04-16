import { useState } from 'react';
import { QATestResult } from './testDefinitions';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface QATestHistoryProps {
  history: QATestResult[];
  onClear: () => void;
}

const QATestHistory = ({ history, onClear }: QATestHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhum teste executado ainda.</p>
        <p className="text-xs mt-1">Selecione testes e clique em Executar.</p>
      </div>
    );
  }

  const passCount = history.filter(r => r.status === 'pass').length;
  const failCount = history.filter(r => r.status === 'fail').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
          <div className="flex gap-2 text-xs">
            <span className="text-green-400">{passCount} ✓</span>
            <span className="text-red-400">{failCount} ✗</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground h-7">
          <Trash2 className="h-3 w-3 mr-1" /> Limpar
        </Button>
      </div>
      <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
        {history.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <div key={r.id} className="rounded-lg bg-muted/30 overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
              >
                {r.status === 'pass' 
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                }
                <span className="font-medium min-w-0 truncate flex-1">{r.testName}</span>
                <span className="text-muted-foreground text-[11px] shrink-0 tabular-nums">{r.duration}ms</span>
                <span className="text-muted-foreground text-[11px] shrink-0">
                  {new Date(r.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {r.details ? (
                  isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                ) : <div className="w-3" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mt-2 mb-1">{r.message}</p>
                  {r.details && (
                    <pre className="text-[11px] text-muted-foreground bg-background/50 rounded p-2 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                      {r.details}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QATestHistory;
