import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Search, Filter, ChevronDown, ChevronUp, ArrowUpDown, CalendarDays } from 'lucide-react';
import { Connection } from '@/hooks/network/useNetworkConnections';
import { format } from 'date-fns';

export type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc';
export type FollowUpFilter = 'all' | 'has_followup' | 'overdue' | 'upcoming' | 'no_followup';
export type LinkedInFilter = 'all' | 'has_linkedin' | 'no_linkedin';

export interface EventFilterOption {
  id: string;
  title: string;
  event_date: string;
}

interface ConnectionFiltersProps {
  connections: Connection[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  followUpFilter: FollowUpFilter;
  onFollowUpFilterChange: (filter: FollowUpFilter) => void;
  linkedInFilter: LinkedInFilter;
  onLinkedInFilterChange: (filter: LinkedInFilter) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
  myEvents: EventFilterOption[];
  filteredCount: number;
  totalCount: number;
}

const ConnectionFilters = ({
  connections,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  followUpFilter,
  onFollowUpFilterChange,
  linkedInFilter,
  onLinkedInFilterChange,
  selectedTag,
  onTagChange,
  selectedEventId,
  onEventChange,
  myEvents,
  filteredCount,
  totalCount
}: ConnectionFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Get unique tags from connections
  const availableTags = Array.from(
    new Set(connections.map(c => c.tag).filter(Boolean) as string[])
  ).sort();
  
  const activeFilterCount = [
    followUpFilter !== 'all' ? followUpFilter : '',
    linkedInFilter !== 'all' ? linkedInFilter : '',
    selectedTag,
    selectedEventId,
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFilterCount > 0;
  
  const clearAllFilters = () => {
    onSearchChange('');
    onSortChange('newest');
    onFollowUpFilterChange('all');
    onLinkedInFilterChange('all');
    onTagChange('');
    onEventChange('');
  };

  return (
    <div className="space-y-3">
      {/* Search + Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        {(searchFocused || hasActiveFilters) && (
          <Button
            variant={showFilters || hasActiveFilters ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5 shrink-0 animate-in fade-in slide-in-from-right-2 duration-200"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-pocketcv-purple">
                {activeFilterCount}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {/* Expandable Filters */}
      {showFilters && (
        <div className="p-3 rounded-lg border bg-muted/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Filters & Sorting</span>
            {(hasActiveFilters || sortBy !== 'newest') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
              <SelectTrigger className="h-9">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* Follow-up Filter */}
            <Select value={followUpFilter} onValueChange={(v) => onFollowUpFilterChange(v as FollowUpFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Follow-up" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All follow-ups</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="has_followup">Has follow-up</SelectItem>
                <SelectItem value="no_followup">No follow-up</SelectItem>
              </SelectContent>
            </Select>

            {/* LinkedIn Filter */}
            <Select value={linkedInFilter} onValueChange={(v) => onLinkedInFilterChange(v as LinkedInFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="LinkedIn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All profiles</SelectItem>
                <SelectItem value="has_linkedin">Has LinkedIn</SelectItem>
                <SelectItem value="no_linkedin">No LinkedIn</SelectItem>
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            {availableTags.length > 0 && (
              <Select value={selectedTag || '_all'} onValueChange={(v) => onTagChange(v === '_all' ? '' : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All tags</SelectItem>
                  {availableTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Event Filter */}
            {myEvents.length > 0 && (
              <Select value={selectedEventId || '_all'} onValueChange={(v) => onEventChange(v === '_all' ? '' : v)}>
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All events" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All events</SelectItem>
                  {myEvents.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} · {format(new Date(event.event_date), 'MMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
      
      {/* Results count when filtered */}
      {(searchTerm || hasActiveFilters) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredCount} of {totalCount} connections
          </span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={clearAllFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectionFilters;
