
import { useState, useEffect, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchOnboardingData } from "@/utils/onboardingUtils";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { ErrorState } from "@/components/onboarding/ErrorState";
import { SuccessState } from "@/components/onboarding/SuccessState";
import { NfcActivationSuccess } from "@/components/onboarding/NfcActivationSuccess";
import { NfcConfirmation } from "@/components/onboarding/NfcConfirmation";
import { supabase } from "@/integrations/supabase/client";

// Personal NFC cards always redirect to personal profile
const getSmartRedirectPath = (profileSlug: string): string => {
  return `/u/${profileSlug}`;
};

const OnboardingPage = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [showActivationSuccess, setShowActivationSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [activatedProfileSlug, setActivatedProfileSlug] = useState<string>("");
  const [activatedUserName, setActivatedUserName] = useState<string>("");
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; slug: string; avatar_url: string | null } | null>(null);
  const hasProcessed = useRef(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (hasProcessed.current) return;

    const checkOnboardingLink = async () => {
      try {
        if (!linkId) {
          setError("Link de registro inválido");
          setLoading(false);
          return;
        }

        hasProcessed.current = true;

        const { data, error: fetchError } = await fetchOnboardingData(linkId);

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError("Link de registro não encontrado na base de dados");
          } else {
            setError("Link de registro inválido ou expirado");
          }
          setErrorDetails(`Detalhes técnicos: Link ID: ${linkId}`);
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Link de registro não encontrado");
          setErrorDetails(`Detalhes técnicos: Link ID: ${linkId}`);
          setLoading(false);
          return;
        }

        setOnboardingData(data);

        // If link already used with a profile, redirect
        if (data.profile_public_link && data.used_by) {
          const redirectPath = getSmartRedirectPath(data.profile_public_link);
          setRedirectTo(redirectPath);
          return;
        }

        // Authenticated user + free card → show confirmation
        if (isAuthenticated && user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('slug, name, email, avatar_url')
            .eq('id', user.id)
            .single();

          if (profileData && profileData.slug) {
            setUserProfile({
              name: profileData.name || '',
              email: profileData.email || user.email || '',
              slug: profileData.slug,
              avatar_url: profileData.avatar_url,
            });
            setShowConfirmation(true);
            setLoading(false);
          } else {
            toast({
              title: "Erro ao processar seu perfil",
              description: "Não foi possível obter seu perfil",
              variant: "destructive"
            });
            setRedirectTo('/dashboard');
          }
          return;
        }

        setLoading(false);
      } catch (err: any) {
        setError("Ocorreu um erro ao verificar o link de registro");
        setErrorDetails(err.message || "Erro desconhecido");
        setLoading(false);
      }
    };

    checkOnboardingLink();
  }, [linkId, authLoading, isAuthenticated, user]);

  const handleConfirmActivation = async () => {
    if (!linkId || !user || !userProfile) return;
    setConfirmationLoading(true);

    try {
      const { data: claimData, error: claimError } = await supabase.functions.invoke('claim-stand-onboarding', {
        body: { linkId, userId: user.id },
      });

      if (claimError || !(claimData as any)?.success) {
        const errorMsg = (claimData as any)?.error || 'Erro desconhecido';
        toast({
          title: "Erro ao ativar o cartão",
          description: errorMsg.includes('already been claimed') 
            ? "Este cartão já foi associado a outra conta." 
            : "Não foi possível finalizar a ativação.",
          variant: "destructive"
        });
        setConfirmationLoading(false);
        return;
      }

      setActivatedProfileSlug(userProfile.slug);
      setActivatedUserName(userProfile.name);
      setShowConfirmation(false);
      setShowActivationSuccess(true);
    } catch (err) {
      toast({
        title: "Erro ao ativar o cartão",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      setConfirmationLoading(false);
    }
  };

  const handleCancelActivation = () => {
    setRedirectTo('/dashboard');
  };

  const handleContinueToProfile = () => {
    setRedirectTo(activatedProfileSlug);
  };

  const handleSignup = () => {
    if (!linkId) {
      toast({ title: "Erro", description: "Link de registro inválido", variant: "destructive" });
      return;
    }
    setRedirectTo(`/login?signup=true&onboarding=${linkId}`);
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-b from-[#7C3AED] via-[#6D28D9] to-[#1A1A1A] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );

  if (redirectTo) {
    const targetPath = redirectTo.startsWith('/') ? redirectTo : `/u/${redirectTo}`;
    return <Navigate to={targetPath} replace />;
  }

  if (authLoading || loading) {
    return <PageWrapper><LoadingState /></PageWrapper>;
  }

  if (error) {
    return <PageWrapper><ErrorState error={error} details={errorDetails || undefined} /></PageWrapper>;
  }

  if (showConfirmation && userProfile) {
    return (
      <NfcConfirmation
        userName={userProfile.name}
        userEmail={userProfile.email}
        avatarUrl={userProfile.avatar_url}
        onConfirm={handleConfirmActivation}
        onCancel={handleCancelActivation}
        isLoading={confirmationLoading}
      />
    );
  }

  if (showActivationSuccess) {
    return (
      <NfcActivationSuccess
        userName={activatedUserName}
        profileSlug={activatedProfileSlug}
        onContinue={handleContinueToProfile}
      />
    );
  }

  return (
    <PageWrapper>
      <SuccessState publicLink={null} linkId={linkId || ''} onSignupClick={handleSignup} />
    </PageWrapper>
  );
};

export default OnboardingPage;
