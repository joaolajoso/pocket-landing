import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Users, UserPlus, Crown, Shield, User, Send,
  Copy, Check, Trash2, ChevronDown, Link2, Search, Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { isPortuguese } from '@/utils/languageHelpers';
import UpgradePricingPopup from '@/components/pricing/UpgradePricingPopup';
import { eventPageThemes } from '@/config/eventPageThemes';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const theme = eventPageThemes.purple;

const PLAN_LIMITS: Record<string, { label: string; maxStaff: number }> = {
  free: { label: 'Free', maxStaff: 1 },
  xs: { label: 'XS', maxStaff: 3 },
  s: { label: 'S', maxStaff: 10 },
  m: { label: 'M', maxStaff: 30 },
  l: { label: 'L', maxStaff: 80 },
  xl: { label: 'XL', maxStaff: -1 },
};

function detectPlan(count: number): string {
  if (count <= 1) return 'free';
  if (count <= 3) return 'xs';
  if (count <= 10) return 's';
  if (count <= 30) return 'm';
  if (count <= 80) return 'l';
  return 'xl';
}

const ALL_PERMISSIONS = [
  { key: 'view_events', label: 'Ver Eventos', labelEn: 'View Events' },
  { key: 'manage_participants', label: 'Gerir Participantes', labelEn: 'Manage Participants' },
  { key: 'manage_stands', label: 'Gerir Stands', labelEn: 'Manage Stands' },
  { key: 'send_announcements', label: 'Enviar Anúncios', labelEn: 'Send Announcements' },
  { key: 'view_metrics', label: 'Ver Métricas', labelEn: 'View Metrics' },
  { key: 'manage_schedule', label: 'Gerir Agenda', labelEn: 'Manage Schedule' },
  { key: 'check_in', label: 'Check-in', labelEn: 'Check-in' },
];

interface TeamMember {
  id: string;
  member_user_id: string;
  role: string;
  status: string;
  permissions: string[];
  invited_email: string | null;
  invite_token: string | null;
  created_at: string;
  profile?: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    slug: string | null;
  };
}

const EventsTeam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const pt = isPortuguese(language);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPricingPopup, setShowPricingPopup] = useState(false);

  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'pending');
  const plan = detectPlan(activeMembers.length);
  const planInfo = PLAN_LIMITS[plan];
  const atLimit = planInfo.maxStaff !== -1 && activeMembers.length >= planInfo.maxStaff;

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizer_team_members')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for active members
      const memberIds = (data || [])
        .filter(m => m.member_user_id)
        .map(m => m.member_user_id);

      let profiles: Record<string, any> = {};
      if (memberIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url, slug')
          .in('id', memberIds);

        (profileData || []).forEach(p => {
          profiles[p.id] = p;
        });
      }

      setMembers((data || []).map(m => ({
        ...m,
        profile: profiles[m.member_user_id] || null,
      })));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Also add self as owner if no members exist
  useEffect(() => {
    if (!loading && members.length === 0 && user) {
      supabase
        .from('organizer_team_members')
        .insert({
          owner_id: user.id,
          member_user_id: user.id,
          role: 'owner',
          status: 'active',
          permissions: ALL_PERMISSIONS.map(p => p.key),
        })
        .then(() => fetchTeam());
    }
  }, [loading, members.length, user, fetchTeam]);

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await supabase.rpc('search_pocketcv_users', {
        search_term: query,
      });
      // Filter out existing members
      const existingIds = new Set(members.map(m => m.member_user_id));
      setSearchResults((data || []).filter(u => !existingIds.has(u.id) && u.id !== user?.id));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (userId: string) => {
    if (!user || atLimit) return;
    try {
      const { error } = await supabase.from('organizer_team_members').insert({
        owner_id: user.id,
        member_user_id: userId,
        role: 'member',
        status: 'active',
        permissions: ['view_events', 'manage_participants'],
      });
      if (error) throw error;
      toast.success(pt ? 'Membro adicionado!' : 'Member added!');
      setSearchQuery('');
      setSearchResults([]);
      fetchTeam();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleInviteByLink = async () => {
    if (!user || atLimit) return;
    try {
      const token = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
      const { error } = await supabase.from('organizer_team_members').insert({
        owner_id: user.id,
        member_user_id: user.id, // placeholder, will be updated on accept
        role: 'member',
        status: 'pending',
        invite_token: token,
        invited_email: inviteEmail || null,
        permissions: ['view_events', 'manage_participants'],
      });
      if (error) throw error;
      toast.success(pt ? 'Link de convite criado!' : 'Invite link created!');
      setInviteEmail('');
      fetchTeam();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organizer_team_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      toast.success(pt ? 'Membro removido' : 'Member removed');
      fetchTeam();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdatePermissions = async (memberId: string, permissions: string[]) => {
    try {
      const { error } = await supabase
        .from('organizer_team_members')
        .update({ permissions })
        .eq('id', memberId);
      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions } : m));
      toast.success(pt ? 'Permissões atualizadas' : 'Permissions updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('organizer_team_members')
        .update({ role })
        .eq('id', memberId);
      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
      toast.success(pt ? 'Papel atualizado' : 'Role updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/events/team/join?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    toast.success(pt ? 'Link copiado!' : 'Link copied!');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      default: return pt ? 'Membro' : 'Member';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.pageBg }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: theme.headerBg, borderColor: theme.cardBorder }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/events')}
            className="shrink-0 hover:bg-white/5"
            style={{ color: theme.textSecondary }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Users className="h-5 w-5" style={{ color: theme.textMuted }} />
          <h1 className="text-lg font-semibold flex-1" style={{ color: theme.textPrimary }}>
            {pt ? 'Equipa de Organização' : 'Organizer Team'}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Plan & Limit Card */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4" style={{ color: theme.accentDot }} />
              <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                {pt ? 'Plano' : 'Plan'} {planInfo.label}
              </span>
            </div>
            <button
              onClick={() => setShowPricingPopup(true)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors"
              style={{ color: theme.accentDot, background: 'rgba(255,255,255,0.06)' }}
            >
              Upgrade
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: theme.textMuted }}>
              {pt ? 'Membros da equipa' : 'Team members'}
            </span>
            <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
              {activeMembers.length} / {planInfo.maxStaff === -1 ? '∞' : planInfo.maxStaff}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: planInfo.maxStaff === -1 ? '5%' : `${Math.min((activeMembers.length / planInfo.maxStaff) * 100, 100)}%`,
                background: atLimit ? '#ef4444' : theme.accentDot,
              }}
            />
          </div>
          {atLimit && (
            <button
              onClick={() => setShowPricingPopup(true)}
              className="text-[11px] text-left transition-colors hover:opacity-80"
              style={{ color: '#ef4444' }}
            >
              {pt
                ? 'Limite de membros atingido. Faça upgrade para adicionar mais.'
                : 'Member limit reached. Upgrade to add more.'}
            </button>
          )}
        </div>

        {/* Invite Section */}
        <div
          className="rounded-2xl p-4 space-y-4"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" style={{ color: theme.textMuted }} />
            <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              {pt ? 'Adicionar Membro' : 'Add Member'}
            </span>
          </div>

          {/* Search existing users */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: theme.textMuted }} />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder={pt ? 'Procurar utilizador PocketCV...' : 'Search PocketCV user...'}
                className="pl-9 h-10 text-sm rounded-xl border-0"
                style={{ background: 'rgba(255,255,255,0.05)', color: theme.textPrimary }}
                disabled={atLimit}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.cardBorder}` }}>
                {searchResults.slice(0, 5).map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleInviteUser(u.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                    style={{ borderBottom: `1px solid ${theme.cardBorder}` }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {u.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>{u.name}</p>
                      <p className="text-[11px] truncate" style={{ color: theme.textMuted }}>{u.slug ? `@${u.slug}` : u.email}</p>
                    </div>
                    <UserPlus className="h-4 w-4 shrink-0" style={{ color: theme.accentDot }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              {pt ? 'ou' : 'or'}
            </span>
            <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
          </div>

          {/* Invite by link */}
          <div className="space-y-2">
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {pt ? 'Convide por link único (email opcional):' : 'Invite by unique link (email optional):'}
            </p>
            <div className="flex gap-2">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 h-9 text-sm rounded-xl border-0"
                style={{ background: 'rgba(255,255,255,0.05)', color: theme.textPrimary }}
                disabled={atLimit}
              />
              <Button
                onClick={handleInviteByLink}
                disabled={atLimit}
                size="sm"
                className="rounded-xl h-9 px-4 gap-2"
                style={{ background: theme.accentDot, color: '#fff' }}
              >
                <Link2 className="h-3.5 w-3.5" />
                {pt ? 'Criar Link' : 'Create Link'}
              </Button>
            </div>
          </div>
        </div>

        {/* Pending Invites */}
        {members.filter(m => m.status === 'pending' && m.invite_token).length > 0 && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              {pt ? 'Convites Pendentes' : 'Pending Invites'}
            </span>
            {members.filter(m => m.status === 'pending' && m.invite_token).map(m => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Send className="h-3.5 w-3.5" style={{ color: theme.textMuted }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: theme.textPrimary }}>
                    {m.invited_email || (pt ? 'Convite por link' : 'Link invite')}
                  </p>
                  <p className="text-[10px]" style={{ color: theme.textMuted }}>
                    {pt ? 'Pendente' : 'Pending'}
                  </p>
                </div>
                <button
                  onClick={() => copyInviteLink(m.invite_token!)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: theme.textMuted }}
                >
                  {copiedToken === m.invite_token ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
                  style={{ color: theme.textMuted }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active Team Members */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
            <Users className="h-4 w-4" style={{ color: theme.textMuted }} />
            <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              {pt ? 'Membros Ativos' : 'Active Members'} ({members.filter(m => m.status === 'active').length})
            </span>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: theme.accentDot, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            members.filter(m => m.status === 'active').map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              const isOwner = member.role === 'owner';
              const isSelf = member.member_user_id === user?.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: `1px solid ${theme.cardBorder}` }}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.profile?.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {member.profile?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>
                        {member.profile?.name || member.invited_email || 'Unknown'}
                      </p>
                      {isSelf && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: theme.textMuted }}>
                          {pt ? 'Você' : 'You'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RoleIcon className="h-3 w-3" style={{ color: isOwner ? theme.accentDot : theme.textMuted }} />
                      <span className="text-[11px]" style={{ color: theme.textMuted }}>
                        {getRoleLabel(member.role)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: theme.textMuted }}>
                        {member.permissions.length} {pt ? 'permissões' : 'permissions'}
                      </span>
                    </div>
                  </div>

                  {!isOwner && !isSelf && (
                    <div className="flex items-center gap-1">
                      {/* Permissions button */}
                      <button
                        onClick={() => setEditingMember(member)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ color: theme.textMuted }}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Role dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="h-8 rounded-lg flex items-center gap-1 px-2 transition-colors hover:bg-white/10"
                            style={{ color: theme.textMuted }}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-slate-900 border-white/10">
                          {['admin', 'member'].map(r => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => handleUpdateRole(member.id, r)}
                              className={cn(
                                'text-sm cursor-pointer',
                                member.role === r ? 'text-white bg-white/10' : 'text-white/60'
                              )}
                            >
                              {r === 'admin' ? 'Admin' : pt ? 'Membro' : 'Member'}
                              {member.role === r && <Check className="h-3 w-3 ml-auto" />}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-sm text-red-400 cursor-pointer hover:text-red-300"
                          >
                            {pt ? 'Remover' : 'Remove'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Permissions Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent
          className="sm:max-w-md border-0"
          style={{ background: theme.cardBg, borderColor: theme.cardBorder, border: `1px solid ${theme.cardBorder}` }}
        >
          <DialogHeader>
            <DialogTitle className="text-base" style={{ color: theme.textPrimary }}>
              {pt ? 'Permissões de' : 'Permissions for'} {editingMember?.profile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 pt-2">
            {ALL_PERMISSIONS.map(perm => {
              const isGranted = editingMember?.permissions.includes(perm.key) || false;
              return (
                <div
                  key={perm.key}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5"
                >
                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                    {pt ? perm.label : perm.labelEn}
                  </span>
                  <Switch
                    checked={isGranted}
                    onCheckedChange={(checked) => {
                      if (!editingMember) return;
                      const newPerms = checked
                        ? [...editingMember.permissions, perm.key]
                        : editingMember.permissions.filter(p => p !== perm.key);
                      handleUpdatePermissions(editingMember.id, newPerms);
                      setEditingMember({ ...editingMember, permissions: newPerms });
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      <UpgradePricingPopup open={showPricingPopup} onOpenChange={setShowPricingPopup} segment="org" />
    </div>
  );
};

export default EventsTeam;
