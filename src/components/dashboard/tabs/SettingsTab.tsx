
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileForm } from "./overview/UserProfileForm";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNetworkPrivacy } from "@/hooks/network/useNetworkPrivacy";
import { Switch } from "@/components/ui/switch";

const NetworkPrivacyToggle = () => {
  const { allowNetworkSaves, toggleAllowNetworkSaves, loading: privacyLoading } = useNetworkPrivacy();
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>Guardar perfil na rede</Label>
        <p className="text-sm text-muted-foreground">
          {allowNetworkSaves ? "Outros utilizadores podem guardar o seu perfil" : "Ninguém pode guardar o seu perfil"}
        </p>
      </div>
      <Switch
        checked={allowNetworkSaves}
        onCheckedChange={toggleAllowNetworkSaves}
        disabled={privacyLoading}
      />
    </div>
  );
};

interface SettingsTabProps {
  userData: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  };
}

const SettingsTab = ({ userData }: SettingsTabProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { profile, loading, error, refreshProfile } = useProfile();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("profile");
  const { t } = useLanguage();

  if (!user) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t.settings.auth.required}</AlertTitle>
        <AlertDescription>
          {t.settings.auth.requiredDescription}
        </AlertDescription>
      </Alert>
    );
  }
  
  const handleFormClose = () => {
    refreshProfile();
    toast({
      title: t.settings.profile.updated,
      description: t.settings.profile.updateDescription
    });
  };

  const handleDeactivateAccount = async () => {
    if (!confirm(t.settings.account.confirmDeactivate)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('deactivate_user_account');
      
      if (error) throw error;

      toast({
        title: t.settings.account.deactivated,
        description: t.settings.account.deactivatedDescription
      });

      // Sign out the user immediately
      await signOut();
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast({
        title: t.settings.account.deactivateError,
        description: t.settings.account.deactivateErrorDescription,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.settings.title}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t.settings.profile.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="profile">{t.settings.tabs.profile}</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          <TabsTrigger value="account">{t.settings.tabs.account}</TabsTrigger>
          <TabsTrigger value="notifications">{t.settings.tabs.notifications}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.profile.title}</CardTitle>
              <CardDescription>
                {t.settings.profile.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm 
                userData={userData} 
                onClose={handleFormClose}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controlo de Privacidade</CardTitle>
              <CardDescription>
                Gere que informações de contacto são visíveis publicamente no seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NetworkPrivacyToggle />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Público</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || "Não definido"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const newValue = !profile?.share_email_publicly;
                    const { error } = await supabase
                      .from('profiles')
                      .update({ share_email_publicly: newValue })
                      .eq('id', user.id);
                    
                    if (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível atualizar a configuração",
                        variant: "destructive"
                      });
                    } else {
                      refreshProfile();
                      toast({
                        title: newValue ? "Email agora público" : "Email agora privado",
                        description: newValue 
                          ? "O seu email está visível no perfil público"
                          : "O seu email não está visível no perfil público"
                      });
                    }
                  }}
                >
                  {profile?.share_email_publicly ? "Tornar Privado" : "Tornar Público"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Telefone Público</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.phone_number || "Não definido"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const newValue = !profile?.share_phone_publicly;
                    const { error } = await supabase
                      .from('profiles')
                      .update({ share_phone_publicly: newValue })
                      .eq('id', user.id);
                    
                    if (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível atualizar a configuração",
                        variant: "destructive"
                      });
                    } else {
                      refreshProfile();
                      toast({
                        title: newValue ? "Telefone agora público" : "Telefone agora privado",
                        description: newValue 
                          ? "O seu telefone está visível no perfil público"
                          : "O seu telefone não está visível no perfil público"
                      });
                    }
                  }}
                >
                  {profile?.share_phone_publicly ? "Tornar Privado" : "Tornar Público"}
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Apenas os dados que marcou como públicos estarão
                  visíveis no seu perfil para outros utilizadores. Pode alterar estas
                  configurações a qualquer momento.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.account.title}</CardTitle>
              <CardDescription>
                {t.settings.account.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t.settings.account.emailLabel}</p>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email || 'No email available'}</p>
              </div>
              
              <div className="space-y-4">
                <Button variant="destructive" onClick={() => {
                  signOut();
                  toast({
                    title: t.settings.account.loggedOut,
                    description: t.settings.account.loggedOutDescription
                  });
                }}>
                  {t.settings.account.logOut}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.account.deactivate}</CardTitle>
              <CardDescription>
                {t.settings.account.deactivateDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeactivateAccount}>
                {t.settings.account.deactivateButton}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.notifications.title}</CardTitle>
              <CardDescription>
                {t.settings.notifications.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.settings.notifications.comingSoon}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTab;
