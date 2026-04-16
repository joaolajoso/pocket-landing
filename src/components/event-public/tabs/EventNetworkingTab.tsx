import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, Mail, Linkedin, Eye, MessageSquare, Info, TrendingUp, Lock } from 'lucide-react';
import NetworkingFilterPopup, { NetworkingFilters, defaultFilters } from '@/components/event-public/NetworkingFilterPopup';
import MatchScoreCard from '@/components/event-public/MatchScoreCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkingMatch, MatchResult } from '@/hooks/network/useNetworkingMatch';
import { useNetworkingPreferences, NetworkingPreferences } from '@/hooks/profile/useNetworkingPreferences';
import { Skeleton } from '@/components/ui/skeleton';
import MeetingRequestDialog from '@/components/event-public/messenger/MeetingRequestDialog';
import { useEventMessenger } from '@/hooks/network/useEventMessenger';

interface Participant {
  id: string;
  user_id: string;
  role: string;
  profile: {
    id: string;
    name: string;
    photo_url?: string;
    job_title?: string;
    headline?: string;
    bio?: string;
    email?: string;
    linkedin?: string;
    slug?: string;
  };
  preferences?: NetworkingPreferences;
  matchResult?: MatchResult;
}

interface EventNetworkingTabProps {
  eventId: string;
  profileComplete: boolean;
}

const EventNetworkingTab = ({ eventId, profileComplete }: EventNetworkingTabProps) => {
  const { user } = useAuth();
  const { preferences: userPreferences, hasPreferences } = useNetworkingPreferences();
  const { calculateMatch } = useNetworkingMatch();
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Participant | null>(null);
  const [showMatchInfo, setShowMatchInfo] = useState(false);
  const [meetingTarget, setMeetingTarget] = useState<Participant | null>(null);
  const [filters, setFilters] = useState<NetworkingFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<'all' | 'participants' | 'business'>('all');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const { sendMeetingRequest } = useEventMessenger(eventId);

  useEffect(() => {
    loadParticipants();
  }, [eventId, user, userPreferences]);

  const loadParticipants = async () => {
    if (!user) return;
    
    try {
      // Fetch all participants except current user
      const { data, error } = await supabase
        .from('event_participants')
        .select('id, user_id, role')
        .eq('event_id', eventId)
        .eq('status', 'participating')
        .neq('user_id', user.id);

      if (error) throw error;
      if (!data || data.length === 0) {
        setParticipants([]);
        setLoading(false);
        return;
      }

      const userIds = data.map((p: any) => p.user_id);

      // Fetch profiles and preferences in parallel
      const [profilesRes, preferencesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, photo_url, job_title, headline, bio, email, linkedin, slug')
          .in('id', userIds),
        supabase
          .from('user_interests')
          .select('user_id, professional_roles, industries, networking_goals')
          .in('user_id', userIds)
      ]);

      const profilesMap = new Map(
        profilesRes.data?.map((p: any) => [p.id, p]) || []
      );
      const preferencesMap = new Map(
        preferencesRes.data?.map((p: any) => [p.user_id, {
          professional_roles: p.professional_roles || [],
          industries: p.industries || [],
          networking_goals: p.networking_goals || []
        }]) || []
      );

      // Map participants with match results
      const mappedParticipants: Participant[] = data.map((p: any) => {
        const targetPrefs = preferencesMap.get(p.user_id);
        const matchResult = calculateMatch(userPreferences, targetPrefs || null);
        
        return {
          id: p.id,
          user_id: p.user_id,
          role: p.role,
          profile: profilesMap.get(p.user_id) || { id: p.user_id, name: 'Anónimo' },
          preferences: targetPrefs,
          matchResult
        };
      });

      // Sort by match score (high probability first)
      mappedParticipants.sort((a, b) => (b.matchResult?.score || 0) - (a.matchResult?.score || 0));

      setParticipants(mappedParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    let result = participants;

    // View mode filter
    if (viewMode === 'business') {
      result = result.filter(p => p.role === 'stand');
    } else if (viewMode === 'participants') {
      result = result.filter(p => p.role !== 'stand');
    }

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const name = p.profile?.name?.toLowerCase() || '';
        const jobTitle = p.profile?.job_title?.toLowerCase() || '';
        const headline = p.profile?.headline?.toLowerCase() || '';
        return name.includes(query) || jobTitle.includes(query) || headline.includes(query);
      });
    }

    // Min score
    if (filters.minScore > 0) {
      result = result.filter(p => (p.matchResult?.score || 0) >= filters.minScore);
    }

    // Has LinkedIn
    if (filters.hasLinkedin) {
      result = result.filter(p => !!p.profile?.linkedin);
    }

    // Has email
    if (filters.hasEmail) {
      result = result.filter(p => !!p.profile?.email);
    }

    // Goals filter - match if participant has ANY of the selected goals
    if (filters.goals.length > 0) {
      result = result.filter(p =>
        p.preferences?.networking_goals.some(g => filters.goals.includes(g))
      );
    }

    // Roles filter
    if (filters.roles.length > 0) {
      result = result.filter(p =>
        p.preferences?.professional_roles.some(r => filters.roles.includes(r))
      );
    }

    // Industries filter
    if (filters.industries.length > 0) {
      result = result.filter(p =>
        p.preferences?.industries.some(i => filters.industries.includes(i))
      );
    }

    // Sorting
    const sorted = [...result];
    switch (filters.sortBy) {
      case 'score-asc':
        sorted.sort((a, b) => (a.matchResult?.score || 0) - (b.matchResult?.score || 0));
        break;
      case 'name-asc':
        sorted.sort((a, b) => (a.profile?.name || '').localeCompare(b.profile?.name || ''));
        break;
      case 'score-desc':
      default:
        sorted.sort((a, b) => (b.matchResult?.score || 0) - (a.matchResult?.score || 0));
        break;
    }

    return sorted;
  }, [participants, searchQuery, filters, viewMode]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.roles.length;
    count += filters.industries.length;
    count += filters.goals.length;
    if (filters.hasLinkedin) count++;
    if (filters.hasEmail) count++;
    if (filters.minScore > 0) count++;
    if (filters.sortBy !== 'score-desc') count++;
    return count;
  }, [filters]);

  const getMatchBadge = (matchResult?: MatchResult) => {
    if (!matchResult) return (
      <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
        0%
      </Badge>
    );
    
    if (matchResult.matchType === 'high-probability') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs gap-1">
          <TrendingUp className="h-3 w-3" />
          {matchResult.score}%
        </Badge>
      );
    }
    
    if (matchResult.matchType === 'interest') {
      return (
        <Badge variant="secondary" className="text-xs gap-1">
          {matchResult.score}%
        </Badge>
      );
    }
    
    // Low match - discrete grey badge
    return (
      <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
        {matchResult.score}%
      </Badge>
    );
  };

  const handleRequestMeeting = (participant: Participant) => {
    setMeetingTarget(participant);
  };

  if (!profileComplete) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Complete o seu perfil</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Para aceder ao networking, complete o seu perfil a 100% na aba "Perfil"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Info */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <NetworkingFilterPopup
          filters={filters}
          onFiltersChange={setFilters}
          activeFilterCount={activeFilterCount}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMatchInfo(true)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* View mode switcher */}
      <div className="flex p-1 rounded-lg bg-muted/50 border border-border/50">
        {([
          { value: 'all', label: 'Todos' },
          { value: 'participants', label: 'Participantes' },
          { value: 'business', label: 'Empresas' },
        ] as const).map(opt => (
          <button
            key={opt.value}
            onClick={() => setViewMode(opt.value)}
            className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all ${
              viewMode === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} ativo{activeFilterCount > 1 ? 's' : ''}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-xs px-1.5 text-muted-foreground"
            onClick={() => setFilters(defaultFilters)}
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Match Info Dialog */}
      <Dialog open={showMatchInfo} onOpenChange={setShowMatchInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Como funciona o Match Score?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              O Match Score calcula a compatibilidade entre si e outros participantes 
              com base em 4 critérios:
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-medium">🎯 Objetivos complementares (50%)</p>
                <p className="text-muted-foreground text-xs">
                  Ex: se procura mentoria e o outro é CEO/Founder, há match!
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">👤 Papéis profissionais em comum (20%)</p>
                <p className="text-muted-foreground text-xs">
                  Partilham o mesmo tipo de cargo ou função
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">🏢 Indústrias em comum (20%)</p>
                <p className="text-muted-foreground text-xs">
                  Atuam nos mesmos setores de atividade
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">🤝 Intenção de networking (10%)</p>
                <p className="text-muted-foreground text-xs">
                  Ambos definiram objetivos de networking
                </p>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Níveis</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  80%+
                </Badge>
                <span>Alta probabilidade — Objetivos complementares!</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  30-79%
                </Badge>
                <span>Interesse — Indústrias ou papéis em comum</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-muted-foreground">
                  &lt;30%
                </Badge>
                <span className="text-muted-foreground">Sem match direto identificado</span>
              </div>
            </div>

            <p className="text-muted-foreground text-xs border-t pt-3">
              💡 Dica: Complete as suas preferências no separador "Perfil" para obter melhores sugestões.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participants Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        {filteredParticipants.length} participantes encontrados
      </div>

      {/* Participants List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredParticipants.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchQuery ? 'Nenhum participante encontrado' : 'Nenhum participante inscrito ainda'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredParticipants.map((participant) => (
            <Card
              key={participant.id}
              className="transition-colors hover:border-primary/50 overflow-hidden"
              onClick={() => setSelectedProfile(participant)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={participant.profile?.photo_url} />
                    <AvatarFallback className="text-sm">
                      {participant.profile?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {participant.profile?.name || 'Anônimo'}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {participant.profile?.job_title || participant.profile?.headline || 'Participante'}
                    </p>
                  </div>

                  {getMatchBadge(participant.matchResult)}

                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(participant);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestMeeting(participant);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil do Participante</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar
                  className="h-16 w-16 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
                  onClick={() => selectedProfile.profile?.photo_url && setPhotoPreview(selectedProfile.profile.photo_url)}
                >
                  <AvatarImage src={selectedProfile.profile?.photo_url} />
                  <AvatarFallback className="text-lg">
                    {selectedProfile.profile?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedProfile.profile?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedProfile.profile?.job_title || selectedProfile.profile?.headline}
                  </p>
                </div>
              </div>

              {selectedProfile.matchResult && selectedProfile.matchResult.score > 0 && (
                <MatchScoreCard matchResult={selectedProfile.matchResult} />
              )}

              {selectedProfile.profile?.bio && (
                <BioSection bio={selectedProfile.profile.bio} />
              )}

              <div className="flex flex-col gap-2 pt-2">
                {selectedProfile.profile?.email && (
                  <Button variant="outline" className="justify-start" asChild>
                    <a href={`mailto:${selectedProfile.profile.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedProfile.profile.email}
                    </a>
                  </Button>
                )}
                {selectedProfile.profile?.linkedin && (
                  <Button variant="outline" className="justify-start" asChild>
                    <a 
                      href={selectedProfile.profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {selectedProfile.profile?.slug && (
                  <Button variant="outline" className="justify-start" asChild>
                    <a 
                      href={`/u/${selectedProfile.profile.slug}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver perfil completo
                    </a>
                  </Button>
                )}
              </div>

              <Button 
                className="w-full"
                onClick={() => handleRequestMeeting(selectedProfile)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Pedir Meeting
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Request Dialog */}
      {meetingTarget && (
        <MeetingRequestDialog
          open={!!meetingTarget}
          onOpenChange={(open) => !open && setMeetingTarget(null)}
          participant={meetingTarget}
          onSend={sendMeetingRequest}
        />
      )}

      {/* Photo Preview Lightbox */}
      <AnimatePresence>
        {photoPreview && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotoPreview(null)}
          >
            <motion.img
              src={photoPreview}
              alt="Foto de perfil"
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const BIO_CHAR_LIMIT = 200;

const BioSection = ({ bio }: { bio: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = bio.length > BIO_CHAR_LIMIT;

  return (
    <div>
      <h4 className="text-sm font-medium mb-1">Bio</h4>
      <p className="text-sm text-muted-foreground whitespace-pre-line">
        {isLong && !expanded ? `${bio.slice(0, BIO_CHAR_LIMIT)}...` : bio}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-medium mt-1 hover:underline"
        >
          {expanded ? 'Ler menos' : 'Ler mais'}
        </button>
      )}
    </div>
  );
};

export default EventNetworkingTab;
