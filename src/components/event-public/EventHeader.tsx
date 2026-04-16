import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Lock, Check, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useEventParticipation } from '@/hooks/useEventParticipation';
import { useToast } from '@/hooks/use-toast';

interface EventHeaderProps {
  event: any;
  isParticipant: boolean;
}

const EventHeader = ({ event, isParticipant }: EventHeaderProps) => {
  const { toast } = useToast();
  const { isParticipating, toggleParticipation } = useEventParticipation(event.id);
  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  // Use hook state after first toggle, otherwise use prop
  const participating = isParticipating || isParticipant;

  const handleParticipate = async () => {
    try {
      await toggleParticipation();
      toast({
        title: participating ? "Removido do evento" : "Adicionado ao evento",
        description: participating 
          ? "Você não está mais participando deste evento" 
          : "Você agora está participando deste evento",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de participação",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      {event.image_url && (
        <div className="aspect-[21/9] overflow-hidden bg-muted">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2 flex-wrap">
              {event.access_type === 'invite_only' && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Convite Apenas
                </Badge>
              )}
              {event.category && (
                <Badge variant="outline">{event.category}</Badge>
              )}
              {participating && (
                <Badge className="gap-1">
                  <Check className="h-3 w-3" />
                  Participando
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold">{event.title}</h1>

            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(eventDate, 'PPP')}
                  {endDate && ` - ${format(endDate, 'PPP')}`}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleParticipate} size="lg">
              {participating ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Participando
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Participar
                </>
              )}
            </Button>
            
            {event.event_url && !event.internal_event && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open(event.event_url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Site do Evento
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventHeader;