import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, FlaskConical, Zap } from 'lucide-react';
import { testDefinitions } from './testDefinitions';
import { useQATests } from './useQATests';
import QATestSelector from './QATestSelector';
import QATestRunner from './QATestRunner';
import QATestHistory from './QATestHistory';

const QATestsTab = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const { history, isRunning, progress, runTests, clearHistory } = useQATests();

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const selectAll = () => setSelected(testDefinitions.map(t => t.id));
  const deselectAll = () => setSelected([]);

  const passCount = history.filter(r => r.status === 'pass').length;
  const failCount = history.filter(r => r.status === 'fail').length;

  // Quick actions
  const runQuickSetup = () => {
    const setupTests = ['create-personal-users', 'create-business-user', 'setup-public-profile', 'create-user-links', 'create-test-event', 'register-event', 'create-connections', 'create-contacts'];
    setSelected(setupTests);
    runTests(setupTests);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">QA Tests</h2>
            <p className="text-sm text-muted-foreground">Testes reais da plataforma PocketCV</p>
          </div>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400 font-medium">{passCount} passed</span>
            <span className="text-red-400 font-medium">{failCount} failed</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runQuickSetup}
          disabled={isRunning}
          className="text-xs gap-1.5"
        >
          <Zap className="h-3.5 w-3.5" />
          Setup Completo (criar tudo)
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const apiTests = testDefinitions.filter(t => t.category === 'Backend API').map(t => t.id);
            setSelected(apiTests);
            runTests(apiTests);
          }}
          disabled={isRunning}
          className="text-xs"
        >
          Testar APIs
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSelected(['cleanup-test-data']);
            runTests(['cleanup-test-data']);
          }}
          disabled={isRunning}
          className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          Limpar tudo
        </Button>
      </div>

      {/* Runner */}
      <QATestRunner isRunning={isRunning} progress={progress} />

      {/* Main Content */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Selector */}
        <div className="rounded-xl border border-border bg-card p-4">
          <QATestSelector
            selected={selected}
            onToggle={toggle}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
          />
          <Button
            className="w-full mt-4 gap-2"
            disabled={selected.length === 0 || isRunning}
            onClick={() => runTests(selected)}
          >
            <Play className="h-4 w-4" />
            Executar{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
        </div>

        {/* History */}
        <div className="rounded-xl border border-border bg-card p-4">
          <QATestHistory history={history} onClear={clearHistory} />
        </div>
      </div>
    </div>
  );
};

export default QATestsTab;
