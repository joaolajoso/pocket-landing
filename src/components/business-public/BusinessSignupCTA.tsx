import { Share2, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicPageTranslations } from "@/translations/publicPage";

interface BusinessSignupCTAProps {
  businessId?: string;
  businessName?: string;
}

export const BusinessSignupCTA = ({ businessId, businessName }: BusinessSignupCTAProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = publicPageTranslations[language] || publicPageTranslations.en;

  const handleGoogleLogin = async () => {
    if (businessId) {
      localStorage.setItem('pendingBusinessConnection', businessId);
    }
    
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
    if (businessId) {
      localStorage.setItem('pendingBusinessConnection', businessId);
    }
    
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

  return (
    <div className="rounded-xl bg-[#2A2A2A]/80 p-5 text-center">
      <Share2 className="w-8 h-8 text-white/80 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-white mb-1">
        {t.createDigitalProfile}
      </h2>
      <p className="text-white/60 text-xs mb-3">
        {t.joinProfessionals}
      </p>
      <p className="text-white/80 font-semibold text-sm mb-4">
        {t.startFree}
      </p>
      <div className="space-y-2">
        <Button 
          onClick={handleGoogleLogin}
          variant="outline" 
          className="w-full bg-white hover:bg-gray-100 text-gray-800 border-0 py-4 rounded-full font-medium text-sm"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t.continueGoogle}
        </Button>
        
        <Button 
          onClick={handleLinkedInLogin}
          className="w-full bg-[#0077B5] hover:bg-[#006097] text-white py-4 rounded-full font-medium text-sm"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          {t.continueLinkedIn}
        </Button>
      </div>
    </div>
  );
};
