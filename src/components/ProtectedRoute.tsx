
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip check if on onboarding page or no user
      if (!user || location.pathname === '/onboarding-setup') {
        setCheckingOnboarding(false);
        setNeedsOnboarding(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setCheckingOnboarding(false);
          return;
        }

        // Only redirect if explicitly false (not null or undefined)
        if (profile && profile.onboarding_completed === false) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } catch (err) {
        console.error('Error in onboarding check:', err);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (!loading && user) {
      checkOnboarding();
    } else if (!loading) {
      setCheckingOnboarding(false);
    }
  }, [user, loading, location.pathname]);

  // Render nothing while checking — avoids flash of loading UI
  if (loading || checkingOnboarding) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed
  if (needsOnboarding && location.pathname !== '/onboarding-setup') {
    return <Navigate to="/onboarding-setup" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
