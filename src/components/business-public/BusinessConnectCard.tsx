import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConnectOptionsDialog from "@/components/profile/ConnectOptionsDialog";
import type { BusinessColorTheme } from "./businessColorThemes";

interface BusinessConnectCardProps {
  businessId: string;
  businessName: string;
  organizationId: string;
  theme: BusinessColorTheme;
}

export const BusinessConnectCard = ({ 
  businessId, 
  businessName, 
  organizationId,
  theme 
}: BusinessConnectCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const firstName = businessName.split(" ")[0];

  // Check if already connected to this business
  useEffect(() => {
    const checkConnection = async () => {
      if (!user || !businessId) return;
      
      const { data } = await supabase
        .from('connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('connected_user_id', businessId)
        .maybeSingle();
      
      setIsConnected(!!data);
    };
    checkConnection();
  }, [user, businessId]);

  const handleConnect = async () => {
    if (!user) {
      setShowConnectDialog(true);
      return;
    }

    if (isConnected) {
      toast({
        title: "Já conectado!",
        description: `${businessName} já está na sua network`,
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Get org owner (created_by) to use as connected_user_id
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('created_by')
        .eq('id', organizationId)
        .single();
      
      if (orgError || !org) throw new Error("Organização não encontrada");

      const ownerUserId = org.created_by;

      // Insert connection: me -> org owner, with connected_organization_id
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: ownerUserId,
          connected_organization_id: organizationId,
        } as any);

      if (error) throw error;

      // Insert reverse connection: org owner -> me (ignore duplicates)
      await supabase
        .from('connections')
        .insert({
          user_id: ownerUserId,
          connected_user_id: user.id,
        } as any)
        .then(() => {});

      setIsConnected(true);
      toast({
        title: "Conectado!",
        description: `${businessName} foi adicionado à sua network`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível conectar",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className={`w-5 h-5 ${theme.textAccent}`} />
          <h2 className="text-base font-bold text-white">Conectar</h2>
        </div>
        
        <p className="text-white/60 text-xs mb-3">
          Adicione {firstName} à sua rede de contactos
        </p>

        <Button 
          onClick={handleConnect}
          disabled={isConnecting || isConnected}
          className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white font-medium py-4 rounded-lg text-sm`}
        >
          {isConnected ? "Conectado!" : isConnecting ? "Conectando..." : `Conectar com ${firstName}`}
        </Button>
      </div>

      {/* Connect Options Dialog for non-logged users */}
      <ConnectOptionsDialog 
        open={showConnectDialog} 
        onOpenChange={setShowConnectDialog}
        profile={{
          id: organizationId,
          name: businessName,
          slug: undefined,
          email: undefined,
          photo_url: undefined,
        }}
      />
    </>
  );
};
