import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StandOnboardingSlides from '@/components/onboarding/StandOnboardingSlides';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StandInviteOnboarding = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [eventName, setEventName] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!linkId) {
      setError('Link inválido.');
      setPageLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch onboarding record
        const { data: onboarding, error: onbErr } = await supabase
          .from('onboarding')
          .select('event_id, used, registration_type')
          .eq('signup_link_id', linkId)
          .single();

        if (onbErr || !onboarding) {
          setError('Link de convite não encontrado.');
          setPageLoading(false);
          return;
        }

        if (onboarding.used) {
          // Already used — redirect to login
          navigate('/login', { replace: true });
          return;
        }

        if (onboarding.event_id) {
          const { data: event } = await supabase
            .from('events')
            .select('title')
            .eq('id', onboarding.event_id)
            .single();

          setEventName(event?.title || 'o evento');
        } else {
          setEventName('o evento');
        }
      } catch {
        setError('Erro ao carregar dados do convite.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [linkId, navigate]);

  // If user is already authenticated, try to claim directly
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && linkId && !pageLoading && !error) {
      const claimStand = async () => {
        try {
          // Check if user is already a Business user with completed onboarding
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          const accountType = user.user_metadata?.account_type;
          const isExistingBusiness = accountType === 'business' && profile?.onboarding_completed === true;

          // Fetch event_id from onboarding record for smart redirect
          const { data: onboardingRecord } = await supabase
            .from('onboarding')
            .select('event_id')
            .eq('signup_link_id', linkId)
            .single();

          const { data: claimData, error: claimErr } = await supabase.functions.invoke('claim-stand-onboarding', {
            body: { linkId, userId: user.id },
          });
          if (claimErr) throw claimErr;
          
          toast({
            title: "Inscrição confirmada!",
            description: "Foi adicionado ao evento como Stand.",
          });

          // Smart redirect: existing Business users go to event management
          if (isExistingBusiness && onboardingRecord?.event_id) {
            navigate(`/events/${onboardingRecord.event_id}/app`, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } catch (err) {
          console.error('Error claiming stand:', err);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar o convite. Redirecionando...",
            variant: "destructive",
          });
          navigate('/dashboard', { replace: true });
        }
      };
      claimStand();
    }
  }, [authLoading, isAuthenticated, user, linkId, pageLoading, error, navigate]);

  const handleComplete = () => {
    navigate(`/login?signup=true&onboarding=${linkId}&account_type=business`);
  };

  if (pageLoading || (authLoading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-pink-500 text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p className="text-white/80 mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-white/90"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  // If authenticated, we're already claiming — show loader
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return <StandOnboardingSlides eventName={eventName} onComplete={handleComplete} />;
};

export default StandInviteOnboarding;
