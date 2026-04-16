import { Connection } from '@/hooks/network/useNetworkConnections';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  CalendarClock,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  Edit,
  UserX,
  Linkedin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Github,
  MessageCircle,
  Send,
  Tag,
  Building2,
  MapPin,
  StickyNote,
  X,
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getProfileUrl } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ConnectionDetailSheetProps {
  connection: Connection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (connection: Connection) => void;
  onRemove: (connectionId: string) => void;
  onUpdateFollowUp?: (connectionId: string, date: string | null) => void;
}

const SOCIAL_ICON_MAP: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  telegram: <Send className="h-4 w-4" />,
  tiktok: <Globe className="h-4 w-4" />,
  website: <Globe className="h-4 w-4" />,
};

const formatLinkUrl = (url: string, iconType?: string): string => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (trimmedUrl.match(/^(https?:\/\/|mailto:|tel:|wa\.me\/)/i)) return trimmedUrl;
  if (iconType?.toLowerCase() === 'whatsapp') {
    const cleanNumber = trimmedUrl.replace(/\D/g, '');
    if (cleanNumber) return `https://wa.me/${cleanNumber}`;
  }
  if (iconType?.toLowerCase() === 'telegram') {
    if (!trimmedUrl.includes('t.me')) return `https://t.me/${trimmedUrl.replace('@', '')}`;
  }
  if (iconType?.toLowerCase() === 'instagram') {
    if (!trimmedUrl.includes('instagram.com')) return `https://instagram.com/${trimmedUrl.replace('@', '')}`;
  }
  if (iconType?.toLowerCase() === 'linkedin') {
    if (!trimmedUrl.includes('linkedin.com')) return `https://linkedin.com/in/${trimmedUrl}`;
  }
  if (!trimmedUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/)) return `https://${trimmedUrl}`;
  return trimmedUrl;
};

const ConnectionDetailSheet = ({
  connection,
  open,
  onOpenChange,
  onEdit,
  onRemove,
  onUpdateFollowUp,
}: ConnectionDetailSheetProps) => {
  const [followUpOpen, setFollowUpOpen] = useState(false);

  if (!connection) return null;

  const profile = connection.profile;
  const avatarUrl = profile?.photo_url || profile?.avatar_url || '';
  const name = profile?.name || 'Unknown';
  const headline = profile?.headline || profile?.job_title || '';
  const slug = profile?.slug || (profile as any)?.username;
  const email = profile?.email;
  const phone = profile?.phone_number;
  const linkedin = profile?.linkedin;
  const website = profile?.website;
  const links = connection.links || [];
  const interests = connection.interests;

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 border-l border-white/10 bg-background/80 backdrop-blur-2xl">
        {/* Header with avatar */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <Avatar className="h-20 w-20 mb-3 ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xl">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <SheetHeader className="text-center space-y-1">
            <SheetTitle className="text-xl">{name}</SheetTitle>
            {headline && (
              <p className="text-sm text-muted-foreground">{headline}</p>
            )}
          </SheetHeader>

          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {connection.tag && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Tag className="h-2.5 w-2.5" />
                {connection.tag}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs gap-1">
              <Calendar className="h-2.5 w-2.5" />
              {format(new Date(connection.created_at), 'dd MMM yyyy')}
            </Badge>
            {connection.follow_up_date && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs gap-1',
                  new Date(connection.follow_up_date) < new Date()
                    ? 'border-destructive/50 text-destructive'
                    : 'border-primary/50 text-primary'
                )}
              >
                <CalendarClock className="h-2.5 w-2.5" />
                Follow-up: {format(new Date(connection.follow_up_date), 'dd MMM')}
              </Badge>
            )}
          </div>

          {/* View profile buttons */}
          <div className="flex gap-2 mt-4 w-full">
            {slug && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => window.open(getProfileUrl(slug), '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver Perfil
              </Button>
            )}
            {connection.businessSubdomain && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
                onClick={() => window.open(`/c/${connection.businessSubdomain}`, '_blank')}
              >
                <Building2 className="h-3.5 w-3.5" />
                Perfil Business
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Notes */}
          {connection.note && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5" />
                Notas
              </h4>
              <p className="text-sm p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 italic leading-relaxed">
                "{connection.note}"
              </p>
            </div>
          )}

          {/* Contact Info */}
          {(email || phone) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contactos
              </h4>
              <div className="space-y-1.5">
                {email && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(email, 'Email')}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{phone}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(phone, 'Telefone')}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(linkedin || website || links.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Redes Sociais
              </h4>
              <div className="flex flex-wrap gap-2">
                {linkedin && (
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-white/5 border-white/10 hover:bg-white/10" onClick={() => window.open(formatLinkUrl(linkedin, 'linkedin'), '_blank')}>
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
                {website && (
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-white/5 border-white/10 hover:bg-white/10" onClick={() => window.open(formatLinkUrl(website, 'website'), '_blank')}>
                    <Globe className="h-4 w-4" />
                    Website
                  </Button>
                )}
                {links.map((link) => (
                  <Button key={link.id} variant="outline" size="sm" className="h-8 gap-1.5 bg-white/5 border-white/10 hover:bg-white/10" onClick={() => window.open(formatLinkUrl(link.url, link.icon), '_blank')}>
                    {SOCIAL_ICON_MAP[link.icon.toLowerCase()] || <Globe className="h-4 w-4" />}
                    {link.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Matchmaking */}
          {interests && (interests.professional_roles.length > 0 || interests.industries.length > 0 || interests.networking_goals.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Matchmaking
              </h4>
              <div className="space-y-2">
                {interests.professional_roles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Roles:</span>
                    {interests.professional_roles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                    ))}
                  </div>
                )}
                {interests.industries.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Industries:</span>
                    {interests.industries.map((i) => (
                      <Badge key={i} variant="outline" className="text-xs">{i}</Badge>
                    ))}
                  </div>
                )}
                {interests.networking_goals.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Goals:</span>
                    {interests.networking_goals.map((g) => (
                      <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ações
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={followUpOpen} onOpenChange={setFollowUpOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    Follow-up
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Follow-up Date</span>
                      {connection.follow_up_date && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { onUpdateFollowUp?.(connection.id, null); setFollowUpOpen(false); }}>
                          <X className="h-3 w-3 mr-1" />
                          Limpar
                        </Button>
                      )}
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={connection.follow_up_date ? new Date(connection.follow_up_date) : undefined}
                      onSelect={(date) => { if (date) { onUpdateFollowUp?.(connection.id, date.toISOString()); setFollowUpOpen(false); } }}
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { onOpenChange(false); onEdit(connection); }}>
                <Edit className="h-4 w-4" />
                Editar Notas
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive col-span-2"
                onClick={() => { onOpenChange(false); onRemove(connection.id); }}
              >
                <UserX className="h-4 w-4" />
                Remover Conexão
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConnectionDetailSheet;
