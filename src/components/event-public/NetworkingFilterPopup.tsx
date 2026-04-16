import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

import { MATCHMAKING_ROLES as ROLES, MATCHMAKING_INDUSTRIES as INDUSTRIES, MATCHMAKING_GOALS as GOALS } from '@/constants/matchmaking-tags';

const SORT_OPTIONS = [
  { value: 'score-desc', label: 'Maior match' },
  { value: 'score-asc', label: 'Menor match' },
  { value: 'name-asc', label: 'Nome A-Z' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];

export interface NetworkingFilters {
  roles: string[];
  industries: string[];
  goals: string[];
  hasLinkedin: boolean;
  hasEmail: boolean;
  minScore: number;
  sortBy: SortOption;
}

export const defaultFilters: NetworkingFilters = {
  roles: [],
  industries: [],
  goals: [],
  hasLinkedin: false,
  hasEmail: false,
  minScore: 0,
  sortBy: 'score-desc',
};

interface NetworkingFilterPopupProps {
  filters: NetworkingFilters;
  onFiltersChange: (filters: NetworkingFilters) => void;
  activeFilterCount: number;
}

const NetworkingFilterPopup = ({ filters, onFiltersChange, activeFilterCount }: NetworkingFilterPopupProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NetworkingFilters>(filters);

  const handleOpen = () => {
    setDraft(filters);
    setOpen(true);
  };

  const handleApply = () => {
    onFiltersChange(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(defaultFilters);
  };

  const toggleArrayItem = (key: 'roles' | 'industries' | 'goals', item: string) => {
    setDraft(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item]
    }));
  };

  const draftActiveCount = useMemo(() => {
    let count = 0;
    count += draft.roles.length;
    count += draft.industries.length;
    count += draft.goals.length;
    if (draft.hasLinkedin) count++;
    if (draft.hasEmail) count++;
    if (draft.minScore > 0) count++;
    if (draft.sortBy !== 'score-desc') count++;
    return count;
  }, [draft]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleOpen}
        className="relative shrink-0"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">Filtros</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground h-7 gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Limpar
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 space-y-5">
              {/* Sort */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ordenar por</h4>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map(opt => (
                    <Button
                      key={opt.value}
                      variant={draft.sortBy === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 rounded-full px-3"
                      onClick={() => setDraft(prev => ({ ...prev, sortBy: opt.value }))}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </section>

              {/* Min Score */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Match mínimo</h4>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 30, 50, 80].map(val => (
                    <Button
                      key={val}
                      variant={draft.minScore === val ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 rounded-full px-3"
                      onClick={() => setDraft(prev => ({ ...prev, minScore: val }))}
                    >
                      {val === 0 ? 'Todos' : `≥ ${val}%`}
                    </Button>
                  ))}
                </div>
              </section>

              {/* Profile completeness */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Perfil</h4>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={draft.hasLinkedin}
                      onCheckedChange={(checked) => setDraft(prev => ({ ...prev, hasLinkedin: !!checked }))}
                    />
                    <span className="text-sm">Tem LinkedIn</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={draft.hasEmail}
                      onCheckedChange={(checked) => setDraft(prev => ({ ...prev, hasEmail: !!checked }))}
                    />
                    <span className="text-sm">Tem email</span>
                  </label>
                </div>
              </section>

              {/* Goals */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Objetivos
                  {draft.goals.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">{draft.goals.length}</Badge>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {GOALS.map(goal => (
                    <Button
                      key={goal}
                      variant={draft.goals.includes(goal) ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 rounded-full px-2.5"
                      onClick={() => toggleArrayItem('goals', goal)}
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </section>

              {/* Roles */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Papéis
                  {draft.roles.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">{draft.roles.length}</Badge>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map(role => (
                    <Button
                      key={role}
                      variant={draft.roles.includes(role) ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 rounded-full px-2.5"
                      onClick={() => toggleArrayItem('roles', role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </section>

              {/* Industries */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Indústrias
                  {draft.industries.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">{draft.industries.length}</Badge>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {INDUSTRIES.map(industry => (
                    <Button
                      key={industry}
                      variant={draft.industries.includes(industry) ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 rounded-full px-2.5"
                      onClick={() => toggleArrayItem('industries', industry)}
                    >
                      {industry}
                    </Button>
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>

          {/* Apply button */}
          <div className="px-4 py-3 border-t border-border shrink-0">
            <Button className="w-full" onClick={handleApply}>
              Aplicar filtros
              {draftActiveCount > 0 && ` (${draftActiveCount})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NetworkingFilterPopup;
