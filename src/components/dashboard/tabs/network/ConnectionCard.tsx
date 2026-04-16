import { Connection } from '@/hooks/network/useNetworkConnections';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Linkedin, Instagram, Globe, Mail, Phone, FileText, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ConnectionCardProps {
  connection: Connection;
  onSelect: (connection: Connection) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  instagram: Instagram,
  website: Globe,
  email: Mail,
  phone: Phone,
  whatsapp: Phone,
  file: FileText,
  pdf: FileText,
  document: FileText,
  portfolio: FileText,
};

const getIconForLink = (icon: string): React.ElementType => {
  const key = icon.toLowerCase();
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return v;
  }
  return LinkIcon;
};

const ConnectionCard = ({ connection, onSelect }: ConnectionCardProps) => {
  const profile = connection.profile;
  const avatarUrl = profile?.photo_url || profile?.avatar_url || '';
  const name = profile?.name || 'Unknown';
  const headline = profile?.headline || profile?.job_title || '';
  const links = connection.links?.filter(l => l.active) || [];

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div
      className="flex flex-col items-center text-center p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer h-full"
      onClick={() => onSelect(connection)}
    >
      {/* Avatar */}
      <Avatar className="h-16 w-16 mb-3 ring-2 ring-primary/10">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="text-lg font-semibold">{getInitials(name)}</AvatarFallback>
      </Avatar>

      {/* Name */}
      <h3 className="font-semibold text-foreground text-sm leading-tight mb-0.5 line-clamp-1">{name}</h3>

      {/* Headline — fixed height for alignment */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 min-h-[2rem]">
        {headline || '\u00A0'}
      </p>

      {/* Social / contact icons row */}
      {links.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-2 min-h-[1.25rem]">
          {links.slice(0, 5).map((link) => {
            const Icon = getIconForLink(link.icon);
            return (
              <Icon
                key={link.id}
                className="h-3.5 w-3.5 text-muted-foreground"
              />
            );
          })}
        </div>
      )}
      {links.length === 0 && <div className="min-h-[1.25rem] mb-2" />}

      {/* Date badge */}
      <div className="flex items-center justify-center mb-3 min-h-[1.25rem]">
        <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5 py-0">
          <Calendar className="h-2 w-2" />
          {format(new Date(connection.created_at), 'dd MMM')}
        </Badge>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* CTA Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-xl text-xs h-9 border-primary/50 text-foreground hover:bg-primary/10 mt-auto"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connection);
        }}
      >
        Follow Up
      </Button>
    </div>
  );
};

export default ConnectionCard;
