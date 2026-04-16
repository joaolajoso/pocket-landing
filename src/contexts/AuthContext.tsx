
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLinkedInProfile } from '@/hooks/auth/useLinkedInProfile';
import { useGoogleProfile } from '@/hooks/auth/useGoogleProfile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any, onboardingLinkId?: string) => Promise<{ error: any }>;
  signUpBusiness: (email: string, password: string, businessData: any, onboardingLinkId?: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { saveLinkedInProfile } = useLinkedInProfile();
  const { saveGoogleProfile } = useGoogleProfile();

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const initializeAuth = async () => {
      try {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
        console.log('[Auth] Initializing... PWA mode:', isPWA);
        
        // ALWAYS check for session, especially critical for PWA reopens
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session fetch error:', error);
        }
        
        if (mounted) {
          console.log('[Auth] Session loaded:', !!initialSession, initialSession?.user?.email);
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Set up auth state listener
          const { data } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] State change:', event, session?.user?.email);
            
            if (mounted) {
              setSession(session);
              setUser(session?.user ?? null);
              
              // Process OAuth profile data automatically on sign in
              if (event === 'SIGNED_IN' && session?.user) {
                const user = session.user;
                const identities = user.identities || [];
                const linkedinIdentity = identities.find((id: any) => id.provider === 'linkedin_oidc');
                const googleIdentity = identities.find((id: any) => id.provider === 'google');
                
                if (linkedinIdentity) {
                  console.log('[Auth] LinkedIn login detected');
                  setTimeout(() => {
                    saveLinkedInProfile(user);
                  }, 100);
                }
                
                if (googleIdentity) {
                  console.log('[Auth] Google login detected');
                  setTimeout(() => {
                    saveGoogleProfile(user);
                  }, 100);
                }

                // Check for pending event registration after email confirmation
                setTimeout(async () => {
                  const eventRegistration = user.user_metadata?.event_registration;
                  if (eventRegistration) {
                    try {
                      const session = await supabase.auth.getSession();
                      const token = session.data.session?.access_token;
                      if (token) {
                        const response = await fetch(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/join-event`,
                          {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ eventId: eventRegistration }),
                          }
                        );
                        if (response.ok) {
                          console.log('[Auth] Auto-joined event after email confirmation:', eventRegistration);
                        }
                      }
                    } catch (err) {
                      console.error('[Auth] Error auto-joining event:', err);
                    }
                  }

                  // Check for pending stand onboarding link
                  const standOnboardingLink = user.user_metadata?.stand_onboarding_link;
                  if (standOnboardingLink) {
                    try {
                      console.log('[Auth] Stand onboarding link detected:', standOnboardingLink);
                      const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claim-stand-onboarding`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ linkId: standOnboardingLink, userId: user.id }),
                        }
                      );
                      if (response.ok) {
                        console.log('[Auth] Stand claimed successfully via onboarding link');
                      } else {
                        console.error('[Auth] Stand claim failed:', await response.text());
                      }
                      // Clear metadata to prevent re-processing
                      await supabase.auth.updateUser({ data: { stand_onboarding_link: null } });
                    } catch (err) {
                      console.error('[Auth] Error claiming stand onboarding:', err);
                    }
                  }
                }, 300);

                // Check for OAuth context from localStorage
                setTimeout(async () => {
                  const oauthOnboarding = localStorage.getItem('oauth_onboarding_link');
                  const oauthInvitation = localStorage.getItem('oauth_invitation_token');
                  
                  if (oauthOnboarding) {
                    localStorage.removeItem('oauth_onboarding_link');
                    console.log('[Auth] OAuth onboarding link found:', oauthOnboarding);
                    // Navigate to process onboarding
                    window.location.href = `/login?onboarding=${oauthOnboarding}`;
                  }
                  
                  if (oauthInvitation) {
                    localStorage.removeItem('oauth_invitation_token');
                    try {
                      const { error } = await supabase.rpc('accept_organization_invitation', { invitation_token_param: oauthInvitation });
                      if (!error) console.log('[Auth] OAuth invitation accepted');
                    } catch (err) {
                      console.error('[Auth] Error accepting OAuth invitation:', err);
                    }
                  }
                  
                }, 200);

                // Check for pending connection after signup/login
                setTimeout(async () => {
                  const pendingConnectionId = localStorage.getItem('pendingConnectionId');
                  if (pendingConnectionId && user.id !== pendingConnectionId) {
                    try {
                      const { data: existingConnection } = await supabase
                        .from('connections')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('connected_user_id', pendingConnectionId)
                        .maybeSingle();

                      if (!existingConnection) {
                        const { error } = await supabase
                          .from('connections')
                          .insert({
                            user_id: user.id,
                            connected_user_id: pendingConnectionId,
                          });

                        if (!error) {
                          console.log('[Auth] Pending connection created successfully');
                        } else {
                          console.error('[Auth] Error creating pending connection:', error);
                        }
                      }
                    } catch (err) {
                      console.error('[Auth] Error processing pending connection:', err);
                    } finally {
                      localStorage.removeItem('pendingConnectionId');
                      localStorage.removeItem('pendingConnectionSlug');
                    }
                  }
                }, 500);
              }
            }
          });
          
          subscription = data.subscription;
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Error initializing:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error };
      
      // Check if user account is deactivated
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Error checking profile status:', profileError);
          return { error: profileError };
        }
        
        if (profile?.status === 'deactivated') {
          // Sign out immediately
          await supabase.auth.signOut();
          return { error: { message: 'User does not exist' } };
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any, onboardingLinkId?: string) => {
    try {
      setLoading(true);
      let redirectUrl = `${window.location.origin}/`;
      if (onboardingLinkId) {
        redirectUrl = `${window.location.origin}/login?onboarding=${onboardingLinkId}`;
      } else if (metadata?.event_registration) {
        redirectUrl = `${window.location.origin}/onboarding?event=${metadata.event_registration}`;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUpBusiness = async (email: string, password: string, businessData: any, onboardingLinkId?: string) => {
    try {
      setLoading(true);
      const redirectUrl = onboardingLinkId 
        ? `${window.location.origin}/login?onboarding=${onboardingLinkId}`
        : `${window.location.origin}/dashboard`;
      
      // Sign up with business account metadata - trigger will create org automatically
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: businessData.name,
            companyName: businessData.companyName,
            companySize: businessData.companySize,
            account_type: 'business',
            stand_onboarding_link: onboardingLinkId || undefined,
          },
        },
      });
      
      // The handle_new_user trigger will automatically:
      // 1. Create the profile
      // 2. Create the organization
      // 3. Add user as organization owner
      // 4. Update profile with organization_id
      
      return { error };
    } catch (error) {
      console.error('Error signing up business:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error signing in with OAuth:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { success: !error, error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Logout initiated');
      
      setUser(null);
      setSession(null);
      setLoading(true);
      
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      console.log('[Auth] Logout completed');
      window.location.href = '/';
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    loading,
    signOut,
    signIn,
    signUp,
    signUpBusiness,
    signInWithOAuth,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
