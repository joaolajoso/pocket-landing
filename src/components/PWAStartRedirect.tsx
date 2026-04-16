import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/profile';

const PWAStartRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const hasRedirected = useRef(false);
  const [waitTimeout, setWaitTimeout] = useState(false);

  useEffect(() => {
    // Timeout de segurança - se demorar muito, vai para dashboard
    const timeout = setTimeout(() => {
      setWaitTimeout(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (hasRedirected.current || authLoading) return;

    // Robust PWA detection (iOS + Android)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    if (!isPWA) return; // Só redireciona em modo PWA
    
    // Só redireciona se estiver na raiz
    if (location.pathname !== '/') return;
    
    console.log('[PWA] Redirect check:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasProfile: !!profile?.slug, 
      authLoading, 
      profileLoading,
      pathname: location.pathname 
    });

    if (isAuthenticated && user) {
      // Se tiver perfil, vai para lá
      if (profile?.slug) {
        console.log('[PWA] Redirecting to profile:', profile.slug);
        hasRedirected.current = true;
        navigate(`/u/${profile.slug}`, { replace: true });
      } 
      // Se timeout expirou, vai para dashboard (mesmo que profile ainda esteja loading)
      else if (waitTimeout) {
        console.log('[PWA] Redirecting to dashboard (timeout)');
        hasRedirected.current = true;
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, profile?.slug, authLoading, profileLoading, navigate, waitTimeout, location.pathname]);

  return null;
};

export default PWAStartRedirect;