import { useState } from 'react';
import { testDefinitions, categories } from './testDefinitions';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

interface QATestSelectorProps {
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const QATestSelector = ({ selected, onToggle, onSelectAll, onDeselectAll }: QATestSelectorProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const selectCategory = (cat: string) => {
    const catTests = testDefinitions.filter(t => t.category === cat);
    const allSelected = catTests.every(t => selected.includes(t.id));
    catTests.forEach(t => {
      if (allSelected && selected.includes(t.id)) onToggle(t.id);
      if (!allSelected && !selected.includes(t.id)) onToggle(t.id);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Selecionar Testes</h3>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={onSelectAll}>Todos</Button>
          <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={onDeselectAll}>Nenhum</Button>
        </div>
      </div>
      <div className="space-y-1">
        {categories.map((cat) => {
          const catTests = testDefinitions.filter(t => t.category === cat);
          const selectedCount = catTests.filter(t => selected.includes(t.id)).length;
          const isCollapsed = collapsed[cat];
          
          return (
            <div key={cat} className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors rounded-lg"
              >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">{cat}</span>
                {selectedCount > 0 && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    {selectedCount}/{catTests.length}
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); selectCategory(cat); }}
                  className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                >
                  {selectedCount === catTests.length ? '−' : '+'}
                </button>
              </button>
              {!isCollapsed && (
                <div className="pl-2 space-y-0.5 pb-1">
                  {catTests.map((test) => (
                    <label
                      key={test.id}
                      className="flex items-start gap-2.5 px-3 py-1.5 rounded-md hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <Checkbox
                        checked={selected.includes(test.id)}
                        onCheckedChange={() => onToggle(test.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium leading-tight">{test.name}</span>
                          {test.destructive && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{test.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QATestSelector;
