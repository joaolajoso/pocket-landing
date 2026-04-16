
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LinkType } from "@/components/LinkCard";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, ExternalLink } from "lucide-react";
import { useSaveOperation } from "@/hooks/useSaveOperation";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";

import NewPublicPagePreview from "./appearance/NewPublicPagePreview";
import BusinessPublicPagePreview from "./appearance/BusinessPublicPagePreview";
import { useProfileDesign, ProfileDesignSettings, defaultDesignSettings } from "@/hooks/profile/useProfileDesign";
import { useProfile } from "@/hooks/useProfile";
import { useExperiences } from "@/hooks/useExperiences";
import { useNetworkingPreferences } from "@/hooks/profile/useNetworkingPreferences";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useProfileMode } from "@/hooks/useProfileMode";

interface LinkGroup {
  id: string;
  title: string;
  displayTitle: boolean;
  position: number;
  links: LinkType[];
}

interface AppearanceTabProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
}

const AppearanceTab = ({ userData: propsUserData, links }: AppearanceTabProps) => {
  const [linkGroups, setLinkGroups] = useState<LinkGroup[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile, refreshProfile } = useProfile();
  const { user } = useAuth();
  const { experiences } = useExperiences();
  const { preferences: interests } = useNetworkingPreferences();
  const { socialLinks } = useSocialLinks();
  const { settings: designSettings, saveDesignSettings, loading: designLoading, refreshSettings } = useProfileDesign();
  const { organization } = useOrganization();
  const { currentMode, setCurrentMode, hasBusinessProfile } = useProfileMode();
  const { saving, performSave, error: saveError } = useSaveOperation({
    retryAttempts: 3,
    timeoutMs: 15000
  });

  // Animation variants for preview transitions
  const previewVariants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 }
  };

  useEffect(() => {
    const fetchLinkGroups = async () => {
      if (!profile?.id) return;

      try {
        const { data: groups, error: groupsError } = await supabase
          .from('link_groups')
          .select('*')
          .eq('user_id', profile.id)
          .order('position');

        if (groupsError) {
          console.error('Error fetching link groups:', groupsError);
          return;
        }

        const { data: links, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profile.id)
          .order('position');

        if (linksError) {
          console.error('Error fetching links:', linksError);
          return;
        }

        const groupsWithLinks = groups.map(group => ({
          id: group.id,
          title: group.title,
          displayTitle: group.display_title,
          position: group.position,
          links: links.filter(link => link.group_id === group.id).map(link => ({
            id: link.id,
            title: link.title,
            url: link.url,
            icon: link.icon
          }))
        }));

        setLinkGroups(groupsWithLinks);
      } catch (error) {
        console.error('Error in fetchLinkGroups:', error);
      }
    };

    fetchLinkGroups();
  }, [profile?.id, links]);

  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phone_number || "");
    }
  }, [profile]);

  const handlePreview = () => {
    if (profile?.slug) {
      window.open(`https://pocketcv.pt/u/${profile.slug}`, '_blank');
    } else if (propsUserData && propsUserData.name) {
      const slug = propsUserData.name.toLowerCase().replace(/\s+/g, '-');
      window.open(`https://pocketcv.pt/u/${slug}`, '_blank');
    } else {
      toast({
        title: "Cannot preview profile",
        description: "Please set your name or username first",
        variant: "destructive"
      });
    }
  };

  const previewUserData = {
    name: profile?.name || user?.email?.split('@')[0] || 'User',
    bio: profile?.bio || 'Your professional bio',
    avatarUrl: profile?.photo_url || '',
    phoneNumber: phoneNumber,
    headline: profile?.headline || '',
    jobTitle: profile?.job_title || '',
    email: profile?.email || '',
    shareEmailPublicly: profile?.share_email_publicly ?? true,
    sharePhonePublicly: profile?.share_phone_publicly ?? true,
  };

  const handleUpdateVisibility = async (field: 'share_email_publicly' | 'share_phone_publicly', value: boolean) => {
    try {
      const success = await updateProfile({ [field]: value });
      if (success) {
        toast({
          title: value ? "Visibilidade ativada" : "Visibilidade desativada",
          description: field === 'share_email_publicly' 
            ? (value ? "O seu email agora está visível na página pública." : "O seu email foi ocultado da página pública.")
            : (value ? "O seu telefone agora está visível na página pública." : "O seu telefone foi ocultado da página pública."),
        });
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visibilidade.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTheme = async (themeKey: string, bgColor: string) => {
    try {
      const success = await saveDesignSettings({ 
        background_color: bgColor,
        button_background_color: bgColor 
      });
      if (success) {
        await refreshSettings();
        toast({
          title: "Tema atualizado",
          description: "A cor do tema foi guardada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tema.",
        variant: "destructive",
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6 relative">
        <LoadingOverlay 
          isVisible={saving} 
          message="Saving appearance settings..." 
        />
        
        {/* Header - Events tab style */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Página Pública</h1>
          <Button onClick={handlePreview} variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/60 hover:bg-muted">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview mode tabs for business users */}
        {organization && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentMode('personal')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currentMode === 'personal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Pessoal
            </button>
            <button
              onClick={() => setCurrentMode('business')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currentMode === 'business' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Business
            </button>
          </div>
        )}

        <p className="text-muted-foreground text-sm text-center max-w-md mx-auto">
          {hasBusinessProfile && currentMode === 'business' 
            ? 'Pré-visualização da sua página Business. Para mostrar este perfil, use o QR/cartão NFC da empresa.'
            : 'O seu cartão NFC pessoal mostra sempre este perfil. Personalize cores e visibilidade do contacto.'
          }
        </p>
        
        <div className="flex flex-col items-center">
          
          {/* Animated Preview Transition */}
          <AnimatePresence mode="wait">
            {hasBusinessProfile && currentMode === 'business' ? (
              <motion.div
                key="business"
                variants={previewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full flex justify-center"
              >
                <BusinessPublicPagePreview />
              </motion.div>
            ) : (
              <motion.div
                key="personal"
                variants={previewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full flex justify-center"
              >
                <NewPublicPagePreview 
                  userData={previewUserData}
                  sections={linkGroups}
                  experiences={experiences}
                  interests={interests}
                  socialLinks={socialLinks}
                  onUpdateVisibility={handleUpdateVisibility}
                  onUpdateTheme={handleUpdateTheme}
                  initialThemeColor={designSettings?.background_color}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {saveError && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Save Error: {saveError}
            </p>
            <Button 
              onClick={handlePreview}
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AppearanceTab;
