import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const usePWAInstallPrevention = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Allow install prompts in dashboard and onboarding
      if ((location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/onboarding')) && isAuthenticated) {
        return; // Don't prevent, let usePWAInstall hook handle it
      }

      // Prevent install prompts on all other pages
      e.preventDefault();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [location.pathname, isAuthenticated]);
};