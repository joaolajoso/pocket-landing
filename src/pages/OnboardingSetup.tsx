import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ParticipantOnboardingWizard } from "@/components/onboarding/ParticipantOnboardingWizard";

const OnboardingSetup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [eventId, setEventId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (loading) return;
      
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Check if user already completed onboarding
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setReady(true);
          return;
        }

        // Detect event context from URL param or user metadata
        const urlEventId = searchParams.get('event');
        const metadataEventId = user.user_metadata?.event_registration;
        const detectedEventId = urlEventId || metadataEventId || null;

        if (profile?.onboarding_completed === true) {
          // Already completed — redirect appropriately
          if (detectedEventId) {
            navigate(`/events/${detectedEventId}/app`, { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          return;
        }

        // Set event context for participant mini-onboarding
        if (detectedEventId) {
          setEventId(detectedEventId);
        }

        setReady(true);
      } catch (err) {
        console.error('Error in onboarding check:', err);
        setReady(true);
      }
    };

    checkOnboardingStatus();
  }, [user, loading, navigate, searchParams]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Event participant flow: lightweight 3-step onboarding
  if (eventId) {
    return <ParticipantOnboardingWizard eventId={eventId} />;
  }

  return <OnboardingWizard />;
};

export default OnboardingSetup;
