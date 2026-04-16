import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface SubdomainRouterProps {
  children: React.ReactNode;
}

/**
 * Detects if the user is accessing via subdomain and redirects to CompanyProfile
 * Examples:
 * - team.pocketcv.pt → renders CompanyProfile with subdomain="team"
 * - pocketcv.pt → renders normal application
 * - www.pocketcv.pt → renders normal application
 */
const SubdomainRouter: React.FC<SubdomainRouterProps> = ({ children }) => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Only process subdomains on production domain (pocketcv.pt)
    // Ignore Lovable preview, localhost, and other development domains
    if (!hostname.includes('pocketcv.pt')) {
      setIsChecking(false);
      return;
    }
    
    // Extract subdomain
    const parts = hostname.split('.');
    
    // Valid subdomains have at least 3 parts: subdomain.pocketcv.pt
    if (parts.length >= 3) {
      const potentialSubdomain = parts[0];
      
      // Handle 'business' subdomain separately
      if (potentialSubdomain === 'business') {
        // Redirect to business dashboard
        window.location.pathname = '/business' + window.location.pathname;
        return;
      }
      
      // Ignore 'www' as it's not a company subdomain
      if (potentialSubdomain !== 'www') {
        setSubdomain(potentialSubdomain);
      }
    }
    
    setIsChecking(false);
  }, []);

  // Show nothing while checking (prevents flash of content)
  if (isChecking) {
    return null;
  }

  // If we detected a subdomain, redirect to the company profile route
  if (subdomain) {
    return <Navigate to={`/c/${subdomain}`} replace />;
  }

  // No subdomain detected, render normal app
  return <>{children}</>;
};

export default SubdomainRouter;
