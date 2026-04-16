import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, CalendarIcon, MessageSquare, Clock, ChevronDown, ChevronRight, Save, MapPin, List, LayoutGrid } from 'lucide-react';
import { useEventCustomContent } from '@/hooks/useEventCustomContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { format, parse } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

// Helper: parse "HH:MM" to minutes from midnight
const timeToMinutes = (t: string): number => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

const SESSION_COLORS = [
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  'bg-amber-500/20 border-amber-500/40 text-amber-300',
  'bg-rose-500/20 border-rose-500/40 text-rose-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
];

interface TimelineItem {
  time: string;
  end_time?: string;
  date?: string;
  title: string;
  description?: string;
  area_id?: string;
  feedback_enabled?: boolean;
}

interface Area {
  id: string;
  name: string;
}

interface TimelineEditorProps {
  eventId: string;
}

interface CalendarAgendaViewProps {
  items: TimelineItem[];
  areas: Area[];
  getAreaName: (id?: string) => string | null;
  formatDateLabel: (dateStr: string) => string;
  getDateFromString: (dateStr?: string) => Date | undefined;
}

const CalendarAgendaView = ({ items, areas, getAreaName, formatDateLabel, getDateFromString }: CalendarAgendaViewProps) => {
  const dates = useMemo(() => {
    const dateSet = new Set<string>();
    items.forEach(item => { if (item.date) dateSet.add(item.date); });
    return Array.from(dateSet).sort();
  }, [items]);

  const { startHour, endHour } = useMemo(() => {
    let minMin = 24 * 60;
    let maxMin = 0;
    items.forEach(item => {
      if (item.time) {
        const s = timeToMinutes(item.time);
        if (s < minMin) minMin = s;
      }
      if (item.end_time) {
        let e = timeToMinutes(item.end_time);
        if (item.time && e < timeToMinutes(item.time)) e += 24 * 60;
        if (e > maxMin) maxMin = e;
      }
    });
    return {
      startHour: Math.max(0, Math.floor(minMin / 60)),
      endHour: Math.min(28, Math.ceil(maxMin / 60) + 1),
    };
  }, [items]);

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = startHour; i < endHour; i++) h.push(i);
    return h;
  }, [startHour, endHour]);

  const HOUR_HEIGHT = 64;

  if (dates.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">Adicione sessões com datas para ver a visualização de agenda</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Column Headers */}
      <div className="flex border-b border-border/40">
        <div className="w-16 flex-shrink-0 bg-card/50 border-r border-border/30" />
        {dates.map((date) => (
          <div key={date} className="flex-1 min-w-[140px] px-2 py-3 text-center border-r border-border/20 last:border-r-0 bg-card/50">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {getDateFromString(date) ? format(getDateFromString(date)!, 'EEE', { locale: pt }) : ''}
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {getDateFromString(date) ? format(getDateFromString(date)!, 'd MMM', { locale: pt }) : date}
            </p>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex overflow-x-auto">
        {/* Time Labels */}
        <div className="w-16 flex-shrink-0 border-r border-border/30">
          {hours.map((h) => (
            <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
              <span className="absolute -top-2 right-2 text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                {(h % 24).toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {dates.map((date) => {
          const dayItems = items
            .map((item, idx) => ({ ...item, originalIndex: idx }))
            .filter(item => item.date === date && item.time);

          return (
            <div key={date} className="flex-1 min-w-[140px] relative border-r border-border/10 last:border-r-0">
              {hours.map((h) => (
                <div key={h} className="border-b border-border/10" style={{ height: HOUR_HEIGHT }} />
              ))}
              {dayItems.map((item) => {
                const startMin = timeToMinutes(item.time);
                let endMin = item.end_time ? timeToMinutes(item.end_time) : startMin + 60;
                if (endMin < startMin) endMin += 24 * 60;
                const duration = endMin - startMin;
                const topPx = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
                const heightPx = Math.max((duration / 60) * HOUR_HEIGHT - 2, 20);
                const colorClass = SESSION_COLORS[item.originalIndex % SESSION_COLORS.length];
                const areaName = getAreaName(item.area_id);

                return (
                  <div
                    key={item.originalIndex}
                    className={cn("absolute left-1 right-1 rounded-md border px-2 py-1 overflow-hidden cursor-default transition-all hover:brightness-110", colorClass)}
                    style={{ top: topPx, height: heightPx }}
                    title={`${item.time}${item.end_time ? ' - ' + item.end_time : ''} — ${item.title}`}
                  >
                    <p className="text-[10px] font-mono opacity-70 leading-none">
                      {item.time}{item.end_time ? ` - ${item.end_time}` : ''}
                    </p>
                    {heightPx > 28 && (
                      <p className="text-xs font-semibold leading-tight mt-0.5 truncate">{item.title}</p>
                    )}
                    {heightPx > 48 && areaName && (
                      <p className="text-[9px] opacity-60 truncate mt-0.5 flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5 inline flex-shrink-0" />
                        {areaName}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// Generate time slots from 00:00 to 23:30 in 30-min intervals
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = (i % 2 === 0) ? '00' : '30';
  return `${h}:${m}`;
});

const TimeSelector = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="h-10 bg-background/50 border-border/50 hover:border-border transition-colors">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="--:--" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-background max-h-60 z-50">
          {TIME_SLOTS.map((t) => (
            <SelectItem key={t} value={t} className="text-sm">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const TimelineEditor = ({ eventId }: TimelineEditorProps) => {
  const { content, loading, createSection, updateSection } = useEventCustomContent(eventId);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [title, setTitle] = useState('Programação do Evento');
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const timelineContent = content.find(c => c.section_type === 'timeline');
    if (timelineContent) {
      setTimelineId(timelineContent.id);
      setTitle(timelineContent.title || 'Programação do Evento');
      setItems(timelineContent.content?.items || []);
    }
  }, [content]);

  useEffect(() => {
    const fetchAreas = async () => {
      const { data } = await supabase
        .from('event_areas')
        .select('id, name')
        .eq('event_id', eventId)
        .order('name');
      if (data) setAreas(data);
    };
    fetchAreas();
  }, [eventId]);

  // Group items by date for visual organization
  const groupedByDate = useMemo(() => {
    const groups: Record<string, { indices: number[] }> = {};
    items.forEach((item, idx) => {
      const key = item.date || 'sem-data';
      if (!groups[key]) groups[key] = { indices: [] };
      groups[key].indices.push(idx);
    });
    return groups;
  }, [items]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addItem = () => {
    const newIndex = items.length;
    setItems([...items, { time: '', end_time: '', date: '', title: '', description: '', area_id: '', feedback_enabled: false }]);
    setExpandedItems(prev => new Set(prev).add(newIndex));
  };

  const duplicateItem = (index: number) => {
    const newItems = [...items];
    const clone = { ...items[index] };
    newItems.splice(index + 1, 0, clone);
    setItems(newItems);
    setExpandedItems(prev => new Set(prev).add(index + 1));
  };

  const updateItem = (index: number, field: keyof TimelineItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setExpandedItems(prev => {
      const next = new Set<number>();
      prev.forEach(v => {
        if (v < index) next.add(v);
        else if (v > index) next.add(v - 1);
      });
      return next;
    });
  };

  const handleDateSelect = (index: number, date: Date | undefined) => {
    if (date) {
      updateItem(index, 'date', format(date, 'yyyy-MM-dd'));
    }
  };

  const getDateFromString = (dateStr?: string): Date | undefined => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, 'yyyy-MM-dd', new Date());
    } catch {
      return undefined;
    }
  };

  const getAreaName = (areaId?: string) => {
    if (!areaId) return null;
    return areas.find(a => a.id === areaId)?.name || null;
  };

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === 'sem-data') return 'Sem data definida';
    const d = getDateFromString(dateStr);
    return d ? format(d, "EEEE, d 'de' MMMM", { locale: pt }) : dateStr;
  };

  const saveItems = async (itemsToSave: TimelineItem[]) => {
    const data = {
      title,
      content: { items: itemsToSave },
    };

    if (timelineId) {
      await updateSection(timelineId, data);
    } else {
      const newSection = await createSection('timeline', title, { items: itemsToSave });
      if (newSection) {
        setTimelineId(newSection.id);
      }
    }
  };

  const handleSave = async () => {
    await saveItems(items);
  };

  if (loading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Programação do Evento</h2>
          <p className="text-sm text-muted-foreground">Configure o cronograma e sessões do evento</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">{items.length} {items.length === 1 ? 'sessão' : 'sessões'}</span>
          <div className="flex items-center rounded-lg border border-border/50 bg-card/50 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === 'list' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === 'calendar' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título da Seção</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Programação do Evento"
          className="mt-1.5 bg-background/50 border-border/50 text-base font-medium"
        />
      </div>

      {/* Timeline Items - List View */}
      {viewMode === 'list' && <div className="space-y-2">
        {items.map((item, index) => {
          const isExpanded = expandedItems.has(index);
          const areaName = getAreaName(item.area_id);
          const hasContent = item.title || item.time;
          const prevDate = index > 0 ? items[index - 1].date : null;
          const showDateHeader = item.date && item.date !== prevDate;

          return (
            <div key={index}>
              {/* Day Header */}
              {showDateHeader && (
                <div className="flex items-center gap-3 pt-4 pb-2 first:pt-0">
                  <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold text-primary capitalize">
                      {formatDateLabel(item.date!)}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border/40" />
                </div>
              )}

              <div
                className={cn(
                  "rounded-xl border transition-all duration-200",
                  isExpanded
                    ? "border-primary/30 bg-card/80 backdrop-blur-sm shadow-sm"
                    : "border-border/40 bg-card/30 hover:bg-card/50 hover:border-border/60"
                )}
              >
              {/* Collapsed Summary Row — always visible */}
              <button
                type="button"
                onClick={() => toggleExpanded(index)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}

                  {/* Number badge */}
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* Summary info */}
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    {item.time && (
                      <span className="text-sm font-mono font-medium text-foreground flex-shrink-0">
                        {item.time}{item.end_time ? ` - ${item.end_time}` : ''}
                      </span>
                    )}
                    {item.title ? (
                      <span className="text-sm text-foreground truncate">{item.title}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground/60 italic">Sessão sem título</span>
                    )}
                  </div>

                  {/* Area pill */}
                  {areaName && !isExpanded && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5 flex-shrink-0">
                      <MapPin className="h-2.5 w-2.5" />
                      {areaName}
                    </span>
                  )}

                  {/* Feedback indicator */}
                  {item.feedback_enabled && !isExpanded && (
                    <MessageSquare className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                  )}
                </div>

                {/* Delete button (visible on hover via group) */}
                <div
                  onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                  className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border/30 mx-3">
                  {/* Row 1: Date + Start + End */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 bg-background/50 border-border/50 hover:border-border",
                              !item.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {item.date
                              ? format(getDateFromString(item.date)!, 'd MMM yyyy', { locale: pt })
                              : 'Selecionar data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={getDateFromString(item.date)}
                            onSelect={(d) => handleDateSelect(index, d)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <TimeSelector
                      value={item.time}
                      onChange={(v) => updateItem(index, 'time', v)}
                      label="Início"
                    />
                    <TimeSelector
                      value={item.end_time || ''}
                      onChange={(v) => updateItem(index, 'end_time', v)}
                      label="Fim"
                    />
                  </div>

                  {/* Row 2: Title + Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        placeholder="Ex: Abertura, Workshop, Coffee Break..."
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Área / Local</Label>
                      <Select
                        value={item.area_id || ''}
                        onValueChange={(v) => updateItem(index, 'area_id', v === 'none' ? '' : v)}
                      >
                        <SelectTrigger className="bg-background/50 border-border/50 hover:border-border transition-colors">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Selecionar local" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="none">Sem área</SelectItem>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição (opcional)</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Breve descrição desta sessão..."
                      rows={2}
                      className="bg-background/50 border-border/50 resize-none"
                    />
                  </div>

                  {/* Row 4: Feedback + Duplicate */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5">
                      <Switch
                        checked={item.feedback_enabled || false}
                        onCheckedChange={(checked) => {
                          const newItems = [...items];
                          newItems[index] = { ...newItems[index], feedback_enabled: checked };
                          setItems(newItems);
                          saveItems(newItems);
                        }}
                      />
                      <Label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Feedback do participante
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => duplicateItem(index)}
                    >
                      Duplicar
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>}

      {/* Calendar/Agenda View */}
      {viewMode === 'calendar' && <CalendarAgendaView items={items} areas={areas} getAreaName={getAreaName} formatDateLabel={formatDateLabel} getDateFromString={getDateFromString} />}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={addItem} variant="outline" className="gap-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5">
          <Plus className="h-4 w-4" />
          Adicionar Sessão
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Programação
        </Button>
      </div>
    </div>
  );
};

export default TimelineEditor;
