
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export const useLinksDisclaimer = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    // Check if user has already accepted the disclaimer
    const hasAccepted = profile.links_disclaimer_accepted;
    
    if (!hasAccepted) {
      setShowDisclaimer(true);
    }
    
    setLoading(false);
  }, [user, profile]);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return {
    showDisclaimer,
    loading,
    handleAcceptDisclaimer
  };
};
