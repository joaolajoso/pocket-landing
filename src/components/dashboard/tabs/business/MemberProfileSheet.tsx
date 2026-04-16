import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ExternalLink, Mail, Phone, Linkedin, Globe, Briefcase, 
  MapPin, FileText, Calendar, Link as LinkIcon, Building2, User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationMember } from "@/hooks/organization/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { BusinessEmployeeCard } from "@/components/business-public/BusinessEmployeeCard";

interface MemberProfileSheetProps {
  member: OrganizationMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MemberFullProfile {
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

interface MemberLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
  group_id?: string;
}

interface MemberLinkGroup {
  id: string;
  title: string;
  display_title: boolean;
  active: boolean;
  links: MemberLink[];
}

interface MemberExperience {
  id: string;
  company_name: string;
  role: string;
  experience_type: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

interface CompanyData {
  companyName: string;
  companyLogo?: string;
  bannerUrl?: string;
  primaryColor?: string;
  subdomain?: string;
  companyPhone?: string;
  companyEmail?: string;
}

const getLinkIcon = (icon: string) => {
  switch (icon) {
    case 'linkedin': return <Linkedin className="h-4 w-4" />;
    case 'globe': return <Globe className="h-4 w-4" />;
    case 'mail': case 'email': return <Mail className="h-4 w-4" />;
    case 'phone': return <Phone className="h-4 w-4" />;
    default: return <LinkIcon className="h-4 w-4" />;
  }
};

const MemberProfileSheet = ({ member, open, onOpenChange }: MemberProfileSheetProps) => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<MemberFullProfile | null>(null);
  const [linkGroups, setLinkGroups] = useState<MemberLinkGroup[]>([]);
  const [ungroupedLinks, setUngroupedLinks] = useState<MemberLink[]>([]);
  const [experiences, setExperiences] = useState<MemberExperience[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && open) {
      fetchMemberData(member.user_id);
    }
  }, [member, open]);

  const fetchMemberData = async (userId: string) => {
    setLoading(true);
    try {
      const [profileRes, linksRes, groupsRes, experiencesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("links").select("*").eq("user_id", userId).eq("active", true).order("position"),
        supabase.from("link_groups").select("*").eq("user_id", userId).eq("active", true).order("position"),
        supabase.from("experiences").select("*").eq("user_id", userId).order("position"),
      ]);

      if (profileRes.data) setProfile(profileRes.data as MemberFullProfile);
      
      const links = (linksRes.data || []) as MemberLink[];
      const groups = (groupsRes.data || []) as any[];
      
      const groupedLinks: MemberLinkGroup[] = groups.map(g => ({
        id: g.id,
        title: g.title,
        display_title: g.display_title,
        active: g.active,
        links: links.filter(l => l.group_id === g.id),
      }));
      
      setLinkGroups(groupedLinks.filter(g => g.links.length > 0));
      setUngroupedLinks(links.filter(l => !l.group_id));
      setExperiences((experiencesRes.data || []) as MemberExperience[]);

      // Fetch company website data for business card
      if (member?.organization_id) {
        const { data: websiteData } = await supabase
          .from("organization_websites")
          .select("company_name, logo_url, banner_image_url, primary_color, subdomain, phone, email, show_phone, show_email")
          .eq("organization_id", member.organization_id)
          .maybeSingle();

        if (websiteData) {
          setCompanyData({
            companyName: websiteData.company_name,
            companyLogo: websiteData.logo_url || undefined,
            bannerUrl: websiteData.banner_image_url || undefined,
            primaryColor: websiteData.primary_color || undefined,
            subdomain: websiteData.subdomain,
            companyPhone: websiteData.show_phone ? (websiteData.phone || undefined) : undefined,
            companyEmail: websiteData.show_email ? (websiteData.email || undefined) : undefined,
          });
        } else {
          // Fallback to org data
          const { data: orgData } = await supabase
            .from("organizations")
            .select("name, logo_url, banner_url")
            .eq("id", member.organization_id)
            .maybeSingle();
          if (orgData) {
            setCompanyData({
              companyName: orgData.name,
              companyLogo: orgData.logo_url || undefined,
              bannerUrl: orgData.banner_url || undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const ensureUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    try {
      return format(new Date(date), "MMM yyyy", { locale: language === 'pt' ? pt : undefined });
    } catch { return date; }
  };

  const renderPersonalProfile = () => (
    <div className="flex flex-col">
      {/* Banner + Avatar */}
      <div className="relative">
        {profile?.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
        )}
        <div className="absolute -bottom-10 left-6">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src={profile?.photo_url || ""} />
            <AvatarFallback className="text-lg">
              {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-14 px-6 pb-6 space-y-6">
        <SheetHeader className="text-left space-y-1 p-0">
          <SheetTitle className="text-xl">{profile?.name || 'Unknown'}</SheetTitle>
          <SheetDescription className="text-sm">
            {profile?.headline || profile?.job_title || ''}
          </SheetDescription>
          {member && (
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="capitalize text-xs">{member.role}</Badge>
              {member.department && <Badge variant="secondary" className="text-xs">{member.department}</Badge>}
            </div>
          )}
        </SheetHeader>

        {profile?.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
        )}

        {(profile?.share_email_publicly && profile?.email || profile?.share_phone_publicly && profile?.phone_number || profile?.linkedin) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              {language === 'pt' ? 'Contacto' : 'Contact'}
            </h4>
            <div className="space-y-1.5">
              {profile?.share_email_publicly && profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </a>
              )}
              {profile?.share_phone_publicly && profile?.phone_number && (
                <a href={`tel:${profile.phone_number}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{profile.phone_number}</span>
                </a>
              )}
              {profile?.linkedin && (
                <a href={ensureUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-4 w-4 shrink-0" />
                  <span className="truncate">LinkedIn</span>
                  <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
                </a>
              )}
            </div>
          </div>
        )}

        <Separator />

        {(ungroupedLinks.length > 0 || linkGroups.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Links</h4>
            {ungroupedLinks.length > 0 && (
              <div className="space-y-1.5">
                {ungroupedLinks.map(link => (
                  <a key={link.id} href={ensureUrl(link.url)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                    {getLinkIcon(link.icon)}
                    <span className="text-sm font-medium flex-1 truncate">{link.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
            {linkGroups.map(group => (
              <div key={group.id} className="space-y-1.5">
                {group.display_title && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{group.title}</p>
                )}
                {group.links.map(link => (
                  <a key={link.id} href={ensureUrl(link.url)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                    {getLinkIcon(link.icon)}
                    <span className="text-sm font-medium flex-1 truncate">{link.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            ))}
            <Separator />
          </div>
        )}

        {experiences.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              {language === 'pt' ? 'Experiência' : 'Experience'}
            </h4>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="flex gap-3 p-2.5 rounded-lg border bg-card">
                  <div className="shrink-0 mt-0.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{exp.role}</p>
                    <p className="text-xs text-muted-foreground truncate">{exp.company_name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(exp.start_date)}{' — '}
                        {exp.is_current ? (language === 'pt' ? 'Presente' : 'Present') : formatDate(exp.end_date)}
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

        {profile?.slug && (
          <div className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'pt' ? 'Ver Página Pública' : 'View Public Page'}
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBusinessProfile = () => (
    <div className="p-6 space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">
          {language === 'pt' ? 'Cartão de Visita Business' : 'Business Card'}
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          {language === 'pt' 
            ? 'Este é o perfil público do colaborador como representante da empresa'
            : 'This is the employee\'s public profile as a company representative'}
        </p>
      </div>

      <BusinessEmployeeCard
        employeeName={profile?.name || 'Unknown'}
        employeePhoto={profile?.photo_url}
        employeePhone={companyData?.companyPhone}
        employeeEmail={companyData?.companyEmail}
        companyName={companyData?.companyName || ''}
        companyLogo={companyData?.companyLogo}
        bannerUrl={companyData?.bannerUrl}
        primaryColor={companyData?.primaryColor}
        slug={profile?.slug}
        ctaLabel="Ver como podemos ajudar"
        ctaUrl={companyData?.subdomain ? `/c/${companyData.subdomain}` : undefined}
      />

      {companyData?.subdomain && (
        <div className="pt-2">
          <Button variant="outline" className="w-full" asChild>
            <a href={`/c/${companyData.subdomain}/${profile?.slug || ''}`} target="_blank" rel="noopener noreferrer">
              <Building2 className="h-4 w-4 mr-2" />
              {language === 'pt' ? 'Ver Página do Membro' : 'View Team Member Page'}
            </a>
          </Button>
        </div>
      )}
    </div>
  );

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
            <Tabs defaultValue="personal" className="w-full">
              <div className="sticky top-0 z-10 bg-background border-b px-4 pt-4 pb-0">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="personal" className="gap-1.5 text-xs">
                    <User className="h-3.5 w-3.5" />
                    {language === 'pt' ? 'Pessoal' : 'Personal'}
                  </TabsTrigger>
                  <TabsTrigger value="business" className="gap-1.5 text-xs">
                    <Building2 className="h-3.5 w-3.5" />
                    Business
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="personal" className="mt-0">
                {renderPersonalProfile()}
              </TabsContent>
              <TabsContent value="business" className="mt-0">
                {renderBusinessProfile()}
              </TabsContent>
            </Tabs>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MemberProfileSheet;
