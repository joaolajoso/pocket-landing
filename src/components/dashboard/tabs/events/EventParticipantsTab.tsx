import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEventParticipants } from '@/hooks/useEventParticipants';
import { useEventAreas } from '@/hooks/useEventAreas';
import { Settings, Building2, Trash2, Users, Search, Camera, Linkedin, Briefcase, BarChart3, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantInsightsPanel } from './ParticipantInsightsPanel';
import { ParticipantProfileSheet } from './ParticipantProfileSheet';

interface EventParticipantsTabProps {
  eventId: string;
}

const PERMISSIONS = [
  { id: 'profile_views', label: 'Ver Visualizações de Perfil' },
  { id: 'leads', label: 'Ver Leads Capturados' },
  { id: 'connections', label: 'Ver Conexões' },
  { id: 'performance_metrics', label: 'Ver Métricas de Performance' },
];

type ProfileFilter = 'all' | 'has_photo' | 'no_photo' | 'has_linkedin' | 'no_linkedin' | 'has_headline' | 'no_headline' | 'incomplete';

const getProfileCompleteness = (user: any): number => {
  if (!user) return 0;
  let score = 0;
  if (user.name) score += 15;
  if (user.photo_url) score += 25;
  if (user.linkedin) score += 15;
  if (user.headline || user.job_title) score += 15;
  if (user.bio) score += 10;
  if (user.email) score += 10;
  if (user.organization_id) score += 10;
  return Math.min(score, 100);
};

export const EventParticipantsTab = ({ eventId }: EventParticipantsTabProps) => {
  const { participants, loading, updateParticipantRole, updateParticipantArea, updatePermission, removeParticipant } = useEventParticipants(eventId);
  const { areas } = useEventAreas(eventId);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all');
  const [showInsights, setShowInsights] = useState(true);
  const [sheetUserId, setSheetUserId] = useState<string | null>(null);
  const [sheetRole, setSheetRole] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = !search || 
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      
      let matchesProfile = true;
      if (profileFilter !== 'all') {
        const u = p.user;
        switch (profileFilter) {
          case 'has_photo': matchesProfile = !!u?.photo_url; break;
          case 'no_photo': matchesProfile = !u?.photo_url; break;
          case 'has_linkedin': matchesProfile = !!u?.linkedin; break;
          case 'no_linkedin': matchesProfile = !u?.linkedin; break;
          case 'has_headline': matchesProfile = !!(u?.headline || u?.job_title); break;
          case 'no_headline': matchesProfile = !(u?.headline || u?.job_title); break;
          case 'incomplete': matchesProfile = getProfileCompleteness(u) < 60; break;
        }
      }
      
      return matchesSearch && matchesRole && matchesProfile;
    });
  }, [participants, search, roleFilter, profileFilter]);

  const totalPages = Math.ceil(filteredParticipants.length / pageSize);
  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParticipants.slice(start, start + pageSize);
  }, [filteredParticipants, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const filterKey = `${search}-${roleFilter}-${profileFilter}`;
  useMemo(() => { setCurrentPage(1); }, [filterKey]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Gestão de Participantes</h2>
          <p className="text-sm text-white/40">
            Gerir participantes e monitorizar a qualidade dos perfis para networking.
          </p>
        </div>
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white/90 text-xs font-medium transition-colors"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Insights
          {showInsights ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: participants.length, color: 'from-blue-500/20 to-blue-600/5' },
          { label: 'Organizadores', value: participants.filter(p => p.role === 'organizer').length, color: 'from-purple-500/20 to-purple-600/5' },
          { label: 'Stands', value: participants.filter(p => p.role === 'stand').length, color: 'from-amber-500/20 to-amber-600/5' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl border border-white/[0.06] bg-gradient-to-br ${stat.color} backdrop-blur-xl p-4`}>
            <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Insights Panel */}
      {showInsights && <ParticipantInsightsPanel participants={participants} />}

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/20"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] bg-white/[0.05] border-white/[0.1] text-white">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="participant">Participantes</SelectItem>
            <SelectItem value="stand">Stands</SelectItem>
            <SelectItem value="organizer">Organizadores</SelectItem>
          </SelectContent>
        </Select>
        <Select value={profileFilter} onValueChange={(v) => setProfileFilter(v as ProfileFilter)}>
          <SelectTrigger className="w-[170px] bg-white/[0.05] border-white/[0.1] text-white">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            <SelectItem value="has_photo">Com foto</SelectItem>
            <SelectItem value="no_photo">Sem foto</SelectItem>
            <SelectItem value="has_linkedin">Com LinkedIn</SelectItem>
            <SelectItem value="no_linkedin">Sem LinkedIn</SelectItem>
            <SelectItem value="has_headline">Com headline</SelectItem>
            <SelectItem value="no_headline">Sem headline</SelectItem>
            <SelectItem value="incomplete">Perfis incompletos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {(search || roleFilter !== 'all' || profileFilter !== 'all') && (
        <p className="text-xs text-white/30">
          {filteredParticipants.length} de {participants.length} participantes
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-white/50">Nome</TableHead>
                  <TableHead className="text-white/50">Perfil</TableHead>
                  <TableHead className="text-white/50">Papel</TableHead>
                  
                  <TableHead className="text-white/50">Completude</TableHead>
                  <TableHead className="text-right text-white/50">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParticipants.map((participant) => {
                  const u = participant.user;
                  const completeness = getProfileCompleteness(u);

                  return (
                    <TableRow key={participant.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                      {/* Name + email */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {u?.photo_url ? (
                              <img src={u.photo_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[11px] font-medium text-white/40">
                                {u?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white text-sm truncate">{u?.name || '-'}</p>
                            <p className="text-[11px] text-white/30 truncate">{u?.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Profile indicators */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`p-1 rounded ${u?.photo_url ? 'text-blue-400' : 'text-white/15'}`}>
                                <Camera className="h-3.5 w-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {u?.photo_url ? 'Tem foto' : 'Sem foto'}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`p-1 rounded ${u?.linkedin ? 'text-sky-400' : 'text-white/15'}`}>
                                <Linkedin className="h-3.5 w-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {u?.linkedin ? 'Tem LinkedIn' : 'Sem LinkedIn'}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`p-1 rounded ${(u?.headline || u?.job_title) ? 'text-violet-400' : 'text-white/15'}`}>
                                <Briefcase className="h-3.5 w-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {u?.headline || u?.job_title || 'Sem headline'}
                            </TooltipContent>
                          </Tooltip>
                          {u?.organization_id && (
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="p-1 rounded text-amber-400">
                                  <Building2 className="h-3.5 w-3.5" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                Tem empresa associada
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Select
                          value={participant.role}
                          onValueChange={(value) => updateParticipantRole(participant.id, value as any)}
                        >
                          <SelectTrigger className="w-[130px] bg-white/[0.05] border-white/[0.1] text-white text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="participant">Participante</SelectItem>
                            <SelectItem value="stand">Stand</SelectItem>
                            <SelectItem value="organizer">Organizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>


                      {/* Completeness */}
                      <TableCell>
                        <div className="flex items-center gap-2 w-[100px]">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${completeness}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-white/40 tabular-nums w-[30px] text-right">{completeness}%</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => setSelectedParticipant(participant)}
                                className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Permissões - {u?.name}</DialogTitle>
                                <DialogDescription>
                                  Gerir as permissões de acesso aos dados deste participante
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                {PERMISSIONS.map((perm) => {
                                  const hasPermission = participant.permissions?.find(
                                    (p: any) => p.permission_type === perm.id
                                  )?.granted || false;

                                  return (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${participant.id}-${perm.id}`}
                                        checked={hasPermission}
                                        onCheckedChange={(checked) => 
                                          updatePermission(participant.id, perm.id, checked as boolean)
                                        }
                                      />
                                      <Label
                                        htmlFor={`${participant.id}-${perm.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {perm.label}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/[0.05] transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Participante?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover {u?.name} do evento?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeParticipant(participant.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-10 w-10 mx-auto text-white/20 mb-3" />
            <p className="text-white/40">
              {participants.length === 0 ? 'Nenhum participante registado ainda.' : 'Nenhum resultado encontrado.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredParticipants.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Por página:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-7 bg-white/[0.05] border-white/[0.1] text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-white/30 ml-2">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredParticipants.length)} de {filteredParticipants.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/40 hover:text-white"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 text-xs ${currentPage === page ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/40 hover:text-white"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Sheet */}
      <ParticipantProfileSheet
        userId={sheetUserId}
        participantRole={sheetRole}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
};
