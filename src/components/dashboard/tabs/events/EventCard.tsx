import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, Star, Check, Lock, BarChart3 } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { format } from 'date-fns';
import { useEventParticipation } from '@/hooks/useEventParticipation';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ParticipantRegistrationDialog, RegistrationData } from '@/components/events/ParticipantRegistrationDialog';

interface MatchStats {
  totalWithTags: number;
  goodMatches: number;
  topRoles: string[];
  topIndustries: string[];
}

interface EventCardProps {
  event: Event;
  initialParticipating?: boolean;
  matchStats?: MatchStats;
}

export const EventCard = ({ event, initialParticipating, matchStats }: EventCardProps) => {
  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'MMM dd, yyyy');
  const eventEndDate = event.end_date ? new Date(event.end_date) : eventDate;
  const isPastEvent = eventEndDate < new Date();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isParticipating, loading, toggleParticipation, trackClick } = useEventParticipation(event.id, initialParticipating);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const handleViewEvent = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    trackClick();
    const url = `/events/${event.id}`;
    const isInternal = event.internal_event === true;
    console.debug('EventCard:view', { id: event.id, isInternal, internal_event: event.internal_event });
    if (isInternal) {
      navigate(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleParticipate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isParticipating) {
      // First time - show registration form
      setShowRegistrationDialog(true);
    } else {
      // Already participating - remove participation
      try {
        await toggleParticipation();
        toast({
          title: "Removed from event",
          description: "You're no longer participating in this event",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update participation status",
          variant: "destructive",
        });
      }
    }
  };

  const handleRegistrationSubmit = async (data: RegistrationData) => {
    try {
      await toggleParticipation(undefined, {
        academicDegree: data.academicDegree,
        educationAreas: data.educationAreas,
        opportunityInterests: data.opportunityInterests
      });
      setShowRegistrationDialog(false);
      toast({
        title: "Successfully registered!",
        description: "You're now participating in this event",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
    }
  };

  const handleRegistrationSkip = async () => {
    try {
      await toggleParticipation();
      setShowRegistrationDialog(false);
      toast({
        title: "Added to event",
        description: "You're now participating in this event",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update participation status",
        variant: "destructive",
      });
    }
  };

  const isInternal = event.internal_event === true;

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer relative",
        isInternal && "ring-1 ring-purple-500/40"
      )} 
      onClick={handleViewEvent}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Featured badge */}
        {event.is_featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </Badge>
          </div>
        )}
        
        {/* Access type badge */}
        {event.access_type !== 'public' && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="gap-1 bg-background/80 backdrop-blur">
              <Lock className="w-3 h-3" />
              {event.access_type === 'invite_only' ? 'Invite Only' : 'Private'}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        {event.category && (
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
        )}

        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Date and Location */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={isParticipating ? "secondary" : "default"}
            size="sm"
            onClick={handleParticipate}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <span className="opacity-50">...</span>
            ) : isParticipating ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Participating
              </>
            ) : (
              'Participate'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewEvent}
            className="flex-1"
          >
            View Event
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
        {/* Match stats + Past event recap + PocketCV tag */}
        <div className="flex items-center justify-between pt-1 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            {isInternal && matchStats && matchStats.goodMatches > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                🎯 {matchStats.goodMatches} {matchStats.goodMatches === 1 ? 'match' : 'matches'}
              </span>
            )}
            {isParticipating && isPastEvent && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-primary h-auto py-1 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/events/${event.id}/recap`);
                }}
              >
                <BarChart3 className="w-3 h-3" />
                View Recap
              </Button>
            )}
          </div>
          {isInternal && (
            <span className="text-[10px] font-medium tracking-wide text-purple-400/80 ml-auto">
              PocketCV Event
            </span>
          )}
        </div>
      </div>

      <ParticipantRegistrationDialog
        open={showRegistrationDialog}
        onOpenChange={setShowRegistrationDialog}
        onSubmit={handleRegistrationSubmit}
        onSkip={handleRegistrationSkip}
      />
    </Card>
  );
};
