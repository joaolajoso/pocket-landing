import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/organization/useOrganization';
import { useToast } from '@/hooks/use-toast';

export type ProfileModeType = 'personal' | 'business';

export interface ProfileModeState {
  /** Current dashboard view mode (session-only, for preview) */
  currentMode: ProfileModeType;
  /** NFC personal card always shows personal profile */
  activeNfcProfile: ProfileModeType;
  /** Whether user has access to business profile */
  hasBusinessProfile: boolean;
  /** Loading state */
  loading: boolean;
  /** Set the dashboard view mode (for preview only) */
  setCurrentMode: (mode: ProfileModeType) => void;
  /** No-op kept for backwards compat - just updates preview mode */
  setActiveNfcProfile: (type: ProfileModeType) => Promise<boolean>;
  /** Organization website subdomain if available */
  businessSubdomain: string | null;
}

const ProfileModeContext = createContext<ProfileModeState | undefined>(undefined);

interface ProfileModeProviderProps {
  children: ReactNode;
}

export const ProfileModeProvider = ({ children }: ProfileModeProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  
  // Session-only mode for dashboard preview
  const [currentMode, setCurrentMode] = useState<ProfileModeType>('personal');
  const [businessSubdomain, setBusinessSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // NFC profile is always personal — no toggle
  const activeNfcProfile: ProfileModeType = 'personal';

  // Check if user has business profile
  const hasBusinessProfile = Boolean(organization);

  // Fetch subdomain for business preview
  const fetchProfileData = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // If has organization, fetch website subdomain
      if (profile?.organization_id) {
        const { data: website } = await supabase
          .from('organization_websites')
          .select('subdomain')
          .eq('organization_id', profile.organization_id)
          .maybeSingle();
        
        setBusinessSubdomain(website?.subdomain || null);
      }
    } catch (err) {
      console.error('Error in fetchProfileData:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // setActiveNfcProfile now only switches preview mode (no DB persistence)
  const setActiveNfcProfile = useCallback(async (type: ProfileModeType): Promise<boolean> => {
    if (type === 'business' && !hasBusinessProfile) {
      toast({
        title: "Sem perfil business",
        description: "Precisa pertencer a uma organização para usar o perfil business.",
        variant: "destructive",
      });
      return false;
    }

    // Just update the preview mode
    setCurrentMode(type);
    return true;
  }, [hasBusinessProfile, toast]);

  // Fetch on mount and when user/auth changes
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Reset to personal if organization is removed
  useEffect(() => {
    if (!hasBusinessProfile && currentMode === 'business') {
      setCurrentMode('personal');
    }
  }, [hasBusinessProfile, currentMode]);

  const value: ProfileModeState = {
    currentMode,
    activeNfcProfile,
    hasBusinessProfile,
    loading,
    setCurrentMode,
    setActiveNfcProfile,
    businessSubdomain,
  };

  return (
    <ProfileModeContext.Provider value={value}>
      {children}
    </ProfileModeContext.Provider>
  );
};

export const useProfileMode = (): ProfileModeState => {
  const context = useContext(ProfileModeContext);
  if (context === undefined) {
    throw new Error('useProfileMode must be used within a ProfileModeProvider');
  }
  return context;
};
