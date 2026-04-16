
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Mail, Calendar, ExternalLink, RefreshCw, Eye, Building2, AlertCircle } from "lucide-react";
import { useNetworkConnections } from "@/hooks/network/useNetworkConnections";
import { useContactSubmissions } from "@/hooks/network/useContactSubmissions";
import { format } from "date-fns";
import { getProfileUrl } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useEventNotifications } from "@/hooks/useEventNotifications";
import { useProfileMode } from "@/hooks/useProfileMode";
import { Progress } from "@/components/ui/progress";
import EventNotificationsSection from "./notifications/EventNotificationsSection";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsSidebar = ({ isOpen, onClose }: NotificationsSidebarProps) => {
  const { user } = useAuth();
  const { connections, loading: connectionsLoading, refreshConnections } = useNetworkConnections();
  const { submissions, loading: submissionsLoading, refetch: refetchSubmissions } = useContactSubmissions();
  const { newConnections, newSubmissions, profileViews, markAsRead } = useNotifications();
  const {
    notifications: eventNotifications,
    activeEvent,
    loading: eventLoading,
    markEventNotificationsRead,
    refetch: refetchEventNotifications,
  } = useEventNotifications();
  const { hasBusinessProfile } = useProfileMode();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  // Business profile completion for notification
  const [businessCompletion, setBusinessCompletion] = useState<number | null>(null);

  useEffect(() => {
    if (!hasBusinessProfile || !isOpen || !user) return;
    
    const fetchCompletion = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.organization_id) return;

      const { data: website } = await supabase
        .from('organization_websites')
        .select('company_name, description, slogan, logo_url, banner_image_url, location, business_hours, services, products, business_type, email, phone, instagram, facebook, website_url')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();
      
      if (!website) { setBusinessCompletion(0); return; }

      const isProducts = website.business_type === 'products';
      const checks = [
        !!website.business_type,
        !!website.company_name && !!website.description && !!website.logo_url,
        !!website.location,
        isProducts ? (Array.isArray(website.products) && (website.products as any[]).length > 0) : (Array.isArray(website.services) && (website.services as any[]).length > 0),
        !!website.email || !!website.phone,
        !!website.instagram || !!website.facebook || !!website.website_url,
      ];
      
      const completed = checks.filter(Boolean).length;
      setBusinessCompletion(Math.round((completed / checks.length) * 100));
    };
    
    fetchCompletion();
  }, [hasBusinessProfile, isOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshConnections(), refetchSubmissions(), refetchEventNotifications()]);
    setRefreshing(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      markAsRead();
      markEventNotificationsRead();
    }
    onClose();
  };

  const getProfileAvatarUrl = (connection: any) => {
    const profile = connection.profile;
    if (!profile) return '';
    return profile.photo_url || profile.avatar_url || '';
  };

  const getProfileSlug = (connection: any) => {
    const profile = connection.profile;
    if (!profile) return null;
    return profile.username || profile.slug || null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notificações</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </SheetHeader>
        
        <ScrollArea className="flex-1 mt-6">
          <div className="space-y-6 pr-4">
            {/* Business Profile Completion - Permanent until 100% */}
            {hasBusinessProfile && businessCompletion !== null && businessCompletion < 100 && (
              <>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Building2 className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Perfil Business Incompleto</p>
                      <p className="text-xs text-muted-foreground">
                        {businessCompletion}% completo — termine a configuração
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={businessCompletion}
                    className="h-1.5 bg-amber-500/10"
                    indicatorClassName="bg-amber-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => {
                      onClose();
                      navigate('/business');
                    }}
                  >
                    <AlertCircle className="h-3 w-3 mr-1.5" />
                    Completar perfil
                  </Button>
                </div>
                <Separator />
              </>
            )}

            {/* Event Notifications - shown first when active */}
            {(activeEvent || eventLoading) && (
              <>
                <EventNotificationsSection
                  eventTitle={activeEvent?.eventTitle || ''}
                  notifications={eventNotifications}
                  loading={eventLoading}
                />
                <Separator />
              </>
            )}

            {/* Profile Views */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-purple-600" />
                <h3 className="font-medium">Visualizações do Perfil</h3>
                {profileViews > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {profileViews}
                  </Badge>
                )}
              </div>
              
              {profileViews > 0 ? (
                <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-foreground/80">
                    O seu perfil foi visualizado <span className="font-medium text-purple-600 dark:text-purple-400">{profileViews}</span> {profileViews === 1 ? 'vez' : 'vezes'} desde a última visita
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem novas visualizações</p>
              )}
            </div>

            <Separator />

            {/* New Connections */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium">Novas Conexões</h3>
                {newConnections.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {newConnections.length}
                  </Badge>
                )}
              </div>
              
              {connectionsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : newConnections.length > 0 ? (
                <div className="space-y-3">
                  {newConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getProfileAvatarUrl(connection)} />
                          <AvatarFallback>
                            {connection.profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">{connection.profile?.name || "Desconhecido"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(connection.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      {getProfileSlug(connection) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getProfileUrl(getProfileSlug(connection) || ''), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem novas conexões</p>
              )}
            </div>

            <Separator />

            {/* New Lead Captures */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-green-600" />
                <h3 className="font-medium">Novos Leads</h3>
                {newSubmissions.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {newSubmissions.length}
                  </Badge>
                )}
              </div>
              
              {submissionsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : newSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {newSubmissions.map((submission) => (
                    <div key={submission.id} className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium text-sm text-foreground">{submission.name}</p>
                          <p className="text-xs text-muted-foreground">{submission.email}</p>
                          {submission.phone && (
                            <p className="text-xs text-muted-foreground">{submission.phone}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(submission.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      {submission.message && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {submission.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem novos leads</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSidebar;
