import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, UserPlus, MessageSquare, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import LeadCaptureForm from "./LeadCaptureForm";
import { useState } from "react";

interface ConnectOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    name: string;
    slug?: string;
    email?: string;
    photo_url?: string;
  };
}

const ConnectOptionsDialog = ({ open, onOpenChange, profile }: ConnectOptionsDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const firstName = (profile.name || 'User').split(" ")[0];

  const handleGoogleLogin = async () => {
    localStorage.setItem('pendingConnectionId', profile.id);
    localStorage.setItem('pendingConnectionSlug', profile.slug || '');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding-setup`,
      },
    });
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLinkedInLogin = async () => {
    localStorage.setItem('pendingConnectionId', profile.id);
    localStorage.setItem('pendingConnectionSlug', profile.slug || '');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/onboarding-setup`,
      },
    });
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEmailSignup = () => {
    localStorage.setItem('pendingConnectionId', profile.id);
    localStorage.setItem('pendingConnectionSlug', profile.slug || '');
    onOpenChange(false);
    navigate('/login');
  };

  const handleLeadFormSubmitted = () => {
    setShowLeadForm(false);
    onOpenChange(false);
    toast({
      title: "Informações enviadas!",
      description: `${firstName} receberá seus dados de contato.`,
    });
  };

  if (showLeadForm) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) setShowLeadForm(false);
        onOpenChange(isOpen);
      }}>
        <DialogContent className="bg-card border-border text-foreground max-w-[calc(100%-2rem)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold mb-2">
              Deixe suas informações
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm text-center mb-4">
            {firstName} receberá seus dados de contato
          </p>
          <LeadCaptureForm
            profileOwnerId={profile.id}
            profileOwnerName={profile.name || 'User'}
            profileOwnerEmail={profile.email}
            profileOwnerPhotoUrl={profile.photo_url}
            onFormSubmitted={handleLeadFormSubmitted}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-[calc(100%-2rem)] sm:max-w-sm p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Conectar com {firstName}
          </DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Escolha como deseja se conectar
        </p>
        
        <div className="space-y-4">
          {/* Create Account Option */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold text-sm">Criar uma conta</h3>
                <p className="text-muted-foreground text-xs">Faça parte da network de {firstName}</p>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Button 
                onClick={handleGoogleLogin}
                variant="outline" 
                className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 h-11 rounded-full font-medium text-sm shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </Button>
              
              <Button 
                onClick={handleLinkedInLogin}
                className="w-full bg-[#0077B5] hover:bg-[#006097] text-white h-11 rounded-full font-medium text-sm shadow-sm"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                Continuar com LinkedIn
              </Button>

              <Button 
                onClick={handleEmailSignup}
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted h-11 rounded-full font-medium text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Criar conta com email
              </Button>
            </div>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Leave Information Option */}
          <div className="space-y-2">
            <Button 
              onClick={() => setShowLeadForm(true)}
              variant="outline"
              className="w-full border-border bg-transparent text-foreground hover:bg-muted h-12 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              Deixar minhas informações
            </Button>
            <p className="text-muted-foreground text-xs text-center">
              Envie seu contato sem criar uma conta
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectOptionsDialog;
