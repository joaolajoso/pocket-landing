import { useParams, useNavigate } from 'react-router-dom';
import { useEventRecap } from '@/hooks/useEventRecap';
import { EventRecapCard } from '@/components/events/EventRecapCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Users, Store, MessageCircle, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';

const rankMedal = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

const LeaderboardSection = ({
  title,
  icon: Icon,
  entries,
}: {
  title: string;
  icon: any;
  entries: { userId: string; name: string; photoUrl: string | null; count: number }[];
}) => {
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-center gap-3"
          >
            <span className="text-lg w-8 text-center">{rankMedal(i + 1)}</span>
            <Avatar className="w-8 h-8">
              <AvatarImage src={entry.photoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {entry.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.name}</p>
            </div>
            <Badge variant="secondary" className="text-xs">{entry.count}</Badge>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

const EventRecapPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { recap, loading } = useEventRecap(eventId || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!recap) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Recap not available for this event.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Event Recap</h1>
            <p className="text-xs text-muted-foreground">{recap.eventTitle}</p>
          </div>
        </div>

        {/* Main Recap Card (shareable) */}
        <EventRecapCard recap={recap} />

        {/* Rankings */}
        {recap.rankings.some(r => r.rank <= r.total) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                Your Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recap.rankings.map((ranking) => (
                <div key={ranking.metric} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{ranking.metric}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={ranking.rank <= 3 ? 'default' : 'secondary'} className="text-xs">
                      #{ranking.rank}
                    </Badge>
                    <span className="text-xs text-muted-foreground">of {ranking.total}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Connections List */}
        {recap.connections.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Connections Made ({recap.connections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {recap.connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                    onClick={() => conn.slug && navigate(`/u/${conn.slug}`)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conn.photo_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conn.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conn.name}</p>
                      {conn.slug && (
                        <p className="text-xs text-muted-foreground">@{conn.slug}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stand Visits Timeline */}
        {recap.standVisits.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                Stands Visited ({recap.standVisits.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recap.standVisits.map((visit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{visit.companyName || visit.standName}</p>
                    <p className="text-xs text-muted-foreground">
                      {visit.visitedAt && format(new Date(visit.visitedAt), "HH:mm", { locale: pt })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Event Leaderboard
          </h2>
          <LeaderboardSection title="Top Networkers" icon={Users} entries={recap.leaderboard.topNetworkers} />
          <LeaderboardSection title="Top Visitors" icon={Store} entries={recap.leaderboard.topVisitors} />
          <LeaderboardSection title="Top Communicators" icon={MessageCircle} entries={recap.leaderboard.topCommunicators} />
        </div>
      </div>
    </div>
  );
};

export default EventRecapPage;
