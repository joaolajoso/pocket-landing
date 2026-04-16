import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Building2, Clock } from 'lucide-react';
import { useParticipantMetrics } from '@/hooks/useParticipantMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ParticipantMetricsPanelProps {
  eventId: string;
  userId: string;
}

const ParticipantMetricsPanel = ({ eventId, userId }: ParticipantMetricsPanelProps) => {
  const { connections, profileViews, standVisits, loading } = useParticipantMetrics(eventId, userId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Minhas Métricas do Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connections.length}</p>
                  <p className="text-sm text-muted-foreground">Conexões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profileViews}</p>
                  <p className="text-sm text-muted-foreground">Visualizações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{standVisits.length}</p>
                  <p className="text-sm text-muted-foreground">Stands Visitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stand Visits Timeline */}
        {standVisits.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Stands Visitados (Ordem Cronológica)
            </h3>
            <div className="space-y-2">
              {standVisits.slice(0, 5).map((visit, index) => (
                <div
                  key={visit.stand_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background border"
                >
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">
                      Stand #{visit.stand_number} - {visit.company_name || visit.stand_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Primeira visita: {format(new Date(visit.first_visit), 'PPp')}
                    </p>
                  </div>
                </div>
              ))}
              {standVisits.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{standVisits.length - 5} mais stands visitados
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Connections */}
        {connections.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conexões Recentes
            </h3>
            <div className="flex flex-wrap gap-2">
              {connections.slice(0, 8).map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background border"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={connection.connected_user?.photo_url} />
                    <AvatarFallback>
                      {connection.connected_user?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{connection.connected_user?.name}</span>
                </div>
              ))}
              {connections.length > 8 && (
                <div className="flex items-center p-2">
                  <p className="text-sm text-muted-foreground">
                    +{connections.length - 8} mais
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Missing import
import { BarChart3 } from 'lucide-react';

export default ParticipantMetricsPanel;