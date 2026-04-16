import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar as CalendarIcon, LayoutGrid, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, Star, X, Target, Plus, BarChart3 } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useUserParticipations } from '@/hooks/useUserParticipations';
import { EventCard } from './events/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCalendar } from './events/EventCalendar';
import { MyEventsTab } from './events/MyEventsTab';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/hooks/useEvents';
import { useEventMatchStats } from '@/hooks/useEventMatchStats';

// Helper para extrair cidade do campo location
const extractCity = (location: string | null): string | null => {
  if (!location) return null;
  if (location.includes(',')) {
    return location.split(',')[0].trim();
  }
  if (location.toLowerCase() !== 'portugal') {
    return location.trim();
  }
  return null;
};

// Helper para extrair país do campo location
const extractCountry = (location: string | null): string | null => {
  if (!location) return null;
  if (location.includes(',')) {
    return location.split(',')[1].trim();
  }
  if (location.toLowerCase() === 'portugal') {
    return 'Portugal';
  }
  return null;
};

// Helper para formatar nome da fonte
const formatSourceName = (source: string | null, isInternal: boolean | null): string => {
  if (isInternal) return 'PocketCV';
  if (!source) return 'Other';
  if (source === 'dev.events') return 'dev.events';
  if (source === 'portugaltechweek.com') return 'Portugal Tech Week';
  return source;
};

// Helper para obter source key único
const getSourceKey = (source: string | null, isInternal: boolean | null): string => {
  if (isInternal) return 'internal';
  return source || 'other';
};

const EventsTab = () => {
  const navigate = useNavigate();
  const { events, loading, refreshEvents } = useEvents();
  const { participatingEventIds } = useUserParticipations();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [hasCreatedEvents, setHasCreatedEvents] = useState(false);
  const [pocketcvOnly, setPocketcvOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [myParticipatingEvents, setMyParticipatingEvents] = useState<Event[]>([]);
  const [participationLoading, setParticipationLoading] = useState(true);
  const [bestForMe, setBestForMe] = useState(false);

  // Collect internal event IDs for match stats
  const internalEventIds = useMemo(() => 
    events.filter(e => e.internal_event === true).map(e => e.id),
    [events]
  );
  const { stats: matchStats, loading: matchStatsLoading } = useEventMatchStats(internalEventIds);

  useEffect(() => {
    checkUserRole();
    checkCreatedEvents();
  }, []);

  useEffect(() => {
    fetchMyParticipation();
  }, [user?.id]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', profile.organization_id)
        .eq('user_id', user.id)
        .single();

      setIsBusinessOwner(member?.role === 'owner' || member?.role === 'admin');
    }
  };

  const checkCreatedEvents = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { count } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', currentUser.id);

    setHasCreatedEvents((count ?? 0) > 0);
  };

  const fetchMyParticipation = async () => {
    if (!user) { setParticipationLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`event_id, role, status, events!inner(*)`)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const evts = (data || []).map((p: any) => ({ ...p.events })) as Event[];
      setMyParticipatingEvents(evts);
    } catch (error) {
      console.error('Error fetching participation:', error);
    } finally {
      setParticipationLoading(false);
    }
  };

  // Extract unique values
  const uniqueCities = [...new Set(events.map(e => extractCity(e.location)).filter(Boolean))].sort() as string[];
  const uniqueCountries = [...new Set(events.map(e => extractCountry(e.location)).filter(Boolean))].sort() as string[];
  const sourceEntries = events.map(e => ({
    key: getSourceKey(e.source, e.internal_event),
    label: formatSourceName(e.source, e.internal_event)
  }));
  const uniqueSourceKeys = [...new Set(sourceEntries.map(s => s.key))];
  const uniqueCategories = [...new Set(events.map(e => e.category).filter(Boolean))].sort();

  const hasFilters = uniqueCities.length > 0 || uniqueCountries.length > 0 || uniqueSourceKeys.length > 0 || uniqueCategories.length > 0;
  const activeFilterCount = [sourceFilter, categoryFilter, countryFilter, cityFilter].filter(f => f !== 'all').length + (pocketcvOnly ? 1 : 0) + (bestForMe ? 1 : 0);

  const applyFilters = (eventList: Event[]) => {
    return eventList.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesSource = sourceFilter === 'all' || getSourceKey(event.source, event.internal_event) === sourceFilter;
      const matchesCity = cityFilter === 'all' || extractCity(event.location) === cityFilter;
      const matchesCountry = countryFilter === 'all' || extractCountry(event.location) === countryFilter;
      const matchesPocketcv = !pocketcvOnly || event.internal_event === true;
      
      const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.event_date);
      const now = new Date();
      const isPastEvent = eventEndDate < now;
      const matchesTime = timeFilter === 'past' ? isPastEvent : !isPastEvent;
      
      return matchesSearch && matchesCategory && matchesSource && matchesCity && matchesCountry && matchesTime && matchesPocketcv;
    });
  };

  const filteredEvents = applyFilters(events);

  // Apply "Best for me" sorting
  const sortedFilteredEvents = useMemo(() => {
    if (!bestForMe) return filteredEvents;
    return [...filteredEvents].sort((a, b) => {
      const aMatches = matchStats[a.id]?.goodMatches || 0;
      const bMatches = matchStats[b.id]?.goodMatches || 0;
      // Internal events with matches first, then by match count desc
      if (aMatches !== bMatches) return bMatches - aMatches;
      // Internal events before external
      if (a.internal_event && !b.internal_event) return -1;
      if (!a.internal_event && b.internal_event) return 1;
      return 0;
    });
  }, [filteredEvents, bestForMe, matchStats]);

  // My participating events filtered
  const myParticipatingIds = new Set(myParticipatingEvents.map(e => e.id));
  const filteredMyEvents = applyFilters(myParticipatingEvents);
  
  // Platform events excluding my participating ones
  const filteredPlatformEvents = sortedFilteredEvents.filter(e => !myParticipatingIds.has(e.id));

  const selectClass = "h-9 w-full rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  const renderUnifiedView = () => {
    if (viewMode === 'calendar') {
      return <EventCalendar events={filteredEvents} />;
    }

    if (loading || participationLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      );
    }

    const hasMyEvents = filteredMyEvents.length > 0;
    const hasPlatformEvents = filteredPlatformEvents.length > 0;

    if (!hasMyEvents && !hasPlatformEvents) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== 'all' 
              ? 'No events found matching your filters.' 
              : 'No upcoming events found.'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* My participating events */}
        {hasMyEvents && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <h3 className="text-sm font-semibold text-foreground">Inscrições</h3>
              <span className="text-xs text-muted-foreground">({filteredMyEvents.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyEvents.map((event) => (
                <EventCard key={event.id} event={event} initialParticipating={true} matchStats={matchStats[event.id]} />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {hasMyEvents && hasPlatformEvents && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Discover</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* All platform events */}
        {hasPlatformEvents && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatformEvents.map((event) => (
              <EventCard key={event.id} event={event} initialParticipating={participatingEventIds.has(event.id)} matchStats={matchStats[event.id]} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/events/create')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Criar Evento
        </button>
        {hasCreatedEvents && (
          <button
            onClick={() => navigate('/events')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent/50 border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Gerir Eventos</span>
          </button>
        )}
      </div>

      {/* Business owner tabs or direct content */}
      {isBusinessOwner ? (
        <Tabs defaultValue="events" className="w-full">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none" data-no-swipe style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <TabsList className="justify-start flex-nowrap shrink-0">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="my-events">My Events</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="space-y-4 mt-4">
            {renderSearchAndFilters()}
            {renderUnifiedView()}
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            <MyEventsTab />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {renderSearchAndFilters()}
          {renderUnifiedView()}
        </div>
      )}
    </div>
  );

  function renderSearchAndFilters() {
    const hasActiveFilters = activeFilterCount > 0;

    return (
      <>
        {/* Search + Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="pl-9 pr-8 h-9 bg-muted/30 border-border/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {(searchFocused || hasActiveFilters) && hasFilters && (
            <Button
              variant={filtersOpen || hasActiveFilters ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5 shrink-0 h-9 animate-in fade-in slide-in-from-right-2 duration-200"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
              {filtersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}
        </div>

        {/* Action Bar: View mode + Time filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none" data-no-swipe style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === 'grid'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                viewMode === 'calendar'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                timeFilter === 'upcoming'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                timeFilter === 'past'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Past
            </button>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-3">
                {/* PocketCV exclusive toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">PocketCV events only</span>
                  </div>
                  <button
                    onClick={() => setPocketcvOnly(!pocketcvOnly)}
                    className={cn(
                      "w-9 h-5 rounded-full transition-colors relative",
                      pocketcvOnly ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                      pocketcvOnly ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                {/* Best for me sort */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">Best audience for me</span>
                  </div>
                  <button
                    onClick={() => setBestForMe(!bestForMe)}
                    className={cn(
                      "w-9 h-5 rounded-full transition-colors relative",
                      bestForMe ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                      bestForMe ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {uniqueSourceKeys.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Source</label>
                      <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={selectClass}>
                        <option value="all">All</option>
                        {uniqueSourceKeys.map(key => {
                          const entry = sourceEntries.find(s => s.key === key);
                          return <option key={key} value={key}>{entry?.label || key}</option>;
                        })}
                      </select>
                    </div>
                  )}
                  {uniqueCategories.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Category</label>
                      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
                        <option value="all">All</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  )}
                  {uniqueCountries.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Country</label>
                      <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className={selectClass}>
                        <option value="all">All</option>
                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {uniqueCities.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">City</label>
                      <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={selectClass}>
                        <option value="all">All</option>
                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={() => { setSourceFilter('all'); setCategoryFilter('all'); setCountryFilter('all'); setCityFilter('all'); setPocketcvOnly(false); setBestForMe(false); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
};

export default EventsTab;
