import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const OptimizedNavigationHandler = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Memoize the navigation decision to prevent unnecessary re-renders
  const navigationComponent = useMemo(() => {
    if (loading) return null;
    
    // Check if this is a PWA launch for authenticated users
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isAuthenticated) {
      if (isPWA) {
        // PWA users will be handled by PWAStartRedirect in AuthenticatedHome
        return null;
      } else {
        // Regular browser - go to dashboard
        return <Navigate to="/dashboard" replace />;
      }
    }
    
    return null;
  }, [isAuthenticated, loading]);

  return navigationComponent;
};

export default OptimizedNavigationHandler;