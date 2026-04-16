import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MessageSquare,
  Handshake,
  Megaphone,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { EventNotificationItem } from "@/hooks/useEventNotifications";

interface EventNotificationsSectionProps {
  eventTitle: string;
  notifications: EventNotificationItem[];
  loading: boolean;
}

const notifConfig: Record<EventNotificationItem['type'], {
  icon: typeof MessageSquare;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  message: {
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500/20',
  },
  meeting_request: {
    icon: Handshake,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500/20',
  },
  announcement: {
    icon: Megaphone,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 dark:bg-red-500/20',
    borderColor: 'border-red-500/20',
  },
  match_alert: {
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500/20',
  },
  welcome: {
    icon: PartyPopper,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    borderColor: 'border-green-500/20',
  },
};

const EventNotificationsSection = ({
  eventTitle,
  notifications,
  loading,
}: EventNotificationsSectionProps) => {
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Evento Ativo</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Evento Ativo</h3>
        {notifications.filter(n => !n.read).length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {notifications.filter(n => !n.read).length}
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-medium">{eventTitle}</p>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.slice(0, 10).map((notif) => {
            const config = notifConfig[notif.type];
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notif.read
                    ? 'bg-muted/30 border-border/50'
                    : `${config.bgColor} ${config.borderColor}`
                }`}
              >
                <div className="flex items-start gap-3">
                  {notif.metadata?.senderPhoto ? (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={notif.metadata.senderPhoto} />
                      <AvatarFallback className="text-xs">
                        {notif.metadata.senderName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`p-1.5 rounded-full flex-shrink-0 ${config.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.timestamp), {
                        addSuffix: true,
                        locale: pt,
                      })}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sem novas notificações do evento</p>
      )}
    </div>
  );
};

export default EventNotificationsSection;
