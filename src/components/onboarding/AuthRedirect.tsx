
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateOnboardingRecord, fetchOnboardingData } from "@/utils/onboardingUtils";
import { supabase } from "@/integrations/supabase/client";

interface AuthRedirectProps {
  onboardingLinkId: string | null;
  userId: string;
}

export const AuthRedirect = ({ onboardingLinkId, userId }: AuthRedirectProps) => {
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const processOnboarding = async () => {
      try {
        if (!onboardingLinkId) {
          console.log("No onboarding link, redirecting to dashboard");
          setSlug(null);
          setLoading(false);
          return;
        }

        console.log("Processing onboarding with link:", onboardingLinkId);

        // Fetch onboarding data first to check if it exists
        let onboardingRecord = null;
        try {
          const { data, error: fetchError } = await fetchOnboardingData(onboardingLinkId);
          if (fetchError) {
            console.warn("Error fetching onboarding data (non-fatal):", fetchError);
          }
          onboardingRecord = data;
        } catch (fetchErr) {
          console.warn("Exception fetching onboarding data (non-fatal):", fetchErr);
        }

        // Try to claim via edge function, but don't block onboarding if it fails
        try {
          // Wait briefly for profile to be created by the trigger
          await new Promise(resolve => setTimeout(resolve, 1500));

          console.log("Claiming onboarding link via edge function");
          const { data, error: claimError } = await supabase.functions.invoke('claim-stand-onboarding', {
            body: { linkId: onboardingLinkId, userId }
          });

          if (claimError) {
            console.warn("Error claiming via edge function (non-fatal):", claimError);
          } else {
            console.log("Onboarding claimed successfully:", data);
          }
        } catch (claimErr) {
          console.warn("Exception claiming onboarding (non-fatal):", claimErr);
        }

        // Always redirect to onboarding setup regardless of claim success
        setSlug('__onboarding__');
        setLoading(false);

        toast({
          title: "Registro completo!",
          description: "Agora vamos configurar o seu perfil.",
          duration: 5000,
        });

      } catch (err: any) {
        console.error("Error in processOnboarding:", err);
        // Even on error, redirect to onboarding-setup instead of showing error
        setSlug('__onboarding__');
        setLoading(false);
        
        toast({
          title: "Bem-vindo!",
          description: "Vamos configurar o seu perfil.",
          duration: 5000,
        });
      }
    };

    processOnboarding();
  }, [onboardingLinkId, userId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <Navigate to="/dashboard" replace />;
  }

  if (slug === '__onboarding__') {
    return <Navigate to="/onboarding-setup" replace />;
  }

  if (slug) {
    return <Navigate to={`/u/${slug}`} replace />;
  }

  return <Navigate to="/dashboard" replace />;
};
