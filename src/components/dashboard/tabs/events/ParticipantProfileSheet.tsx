import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Linkedin, Mail, Phone, Globe, ExternalLink, Briefcase, Calendar, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ParticipantProfileSheetProps {
  userId: string | null;
  participantRole?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileData {
  name?: string;
  headline?: string;
  bio?: string;
  email?: string;
  phone_number?: string;
  linkedin?: string;
  website?: string;
  photo_url?: string;
  banner_url?: string;
  slug?: string;
  job_title?: string;
  share_email_publicly?: boolean;
  share_phone_publicly?: boolean;
}

interface ProfileLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  group_id?: string;
}

interface ProfileExperience {
  id: string;
  company_name: string;
  role: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

const ensureUrl = (url: string) => {
  if (!url) return '#';
  return url.startsWith('http') ? url : `https://${url}`;
};

const getLinkIcon = (icon: string) => {
  switch (icon) {
    case 'linkedin': return <Linkedin className="h-4 w-4" />;
    case 'globe': return <Globe className="h-4 w-4" />;
    case 'mail': case 'email': return <Mail className="h-4 w-4" />;
    case 'phone': return <Phone className="h-4 w-4" />;
    default: return <LinkIcon className="h-4 w-4" />;
  }
};

export const ParticipantProfileSheet = ({ userId, participantRole, open, onOpenChange }: ParticipantProfileSheetProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [experiences, setExperiences] = useState<ProfileExperience[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && open) {
      fetchData(userId);
    }
  }, [userId, open]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const [profileRes, linksRes, experiencesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        supabase.from('links').select('id, title, url, icon, group_id').eq('user_id', uid).eq('active', true).order('position'),
        supabase.from('experiences').select('*').eq('user_id', uid).order('position'),
      ]);

      if (profileRes.data) setProfile(profileRes.data as ProfileData);
      setLinks((linksRes.data || []) as ProfileLink[]);
      setExperiences((experiencesRes.data || []) as ProfileExperience[]);
    } catch (error) {
      console.error('Error fetching participant profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    try { return format(new Date(date), 'MMM yyyy', { locale: pt }); } catch { return date; }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'organizer': return 'Organizador';
      case 'stand': return 'Stand';
      default: return 'Participante';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : profile ? (
            <div className="flex flex-col">
              {/* Banner + Avatar */}
              <div className="relative">
                {profile.banner_url ? (
                  <img src={profile.banner_url} alt="" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
                )}
                <div className="absolute -bottom-10 left-6">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarImage src={profile.photo_url || ''} />
                    <AvatarFallback className="text-lg">
                      {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="pt-14 px-6 pb-6 space-y-5">
                {/* Name & headline */}
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{profile.name || 'Desconhecido'}</h2>
                  {(profile.headline || profile.job_title) && (
                    <p className="text-sm text-muted-foreground">{profile.headline || profile.job_title}</p>
                  )}
                  {participantRole && (
                    <Badge variant="outline" className="capitalize text-xs mt-1">
                      {getRoleLabel(participantRole)}
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                )}

                {/* Contact */}
                {(profile.email || profile.phone_number || profile.linkedin) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Contacto</h4>
                    <div className="space-y-1.5">
                      {profile.share_email_publicly && profile.email && (
                        <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{profile.email}</span>
                        </a>
                      )}
                      {profile.share_phone_publicly && profile.phone_number && (
                        <a href={`tel:${profile.phone_number}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{profile.phone_number}</span>
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={ensureUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Linkedin className="h-4 w-4 shrink-0" />
                          <span>LinkedIn</span>
                          <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Links */}
                {links.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Links</h4>
                    <div className="space-y-1.5">
                      {links.map(link => (
                        <a key={link.id} href={ensureUrl(link.url)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                          {getLinkIcon(link.icon)}
                          <span className="text-sm font-medium flex-1 truncate">{link.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Experience */}
                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Experiência</h4>
                    <div className="space-y-2">
                      {experiences.map(exp => (
                        <div key={exp.id} className="flex gap-3 p-2.5 rounded-lg border bg-card">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{exp.role}</p>
                            <p className="text-xs text-muted-foreground truncate">{exp.company_name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(exp.start_date)}{' — '}
                                {exp.is_current ? 'Presente' : formatDate(exp.end_date)}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public page link */}
                {profile.slug && (
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Página Pública
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
