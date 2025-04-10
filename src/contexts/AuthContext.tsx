
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'linkedin_oidc') => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
    try {
      setLoading(true);
      
      // First, check if this email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing user:", checkError);
      }
      
      if (existingUsers) {
        toast({
          title: "Email already in use",
          description: "This email address is already registered. Please log in or use a different email.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Try to create the user
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "You can now sign in to your account"
      });
      
      // Instead of immediately navigating, provide confirmation
      setLoading(false);
      navigate('/login');
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      // Provide more specific error messages
      let errorMessage = "There was a problem creating your account";
      
      if (error.message.includes("unique constraint")) {
        errorMessage = "This email is already registered. Please try signing in.";
      } else if (error.message.includes("password")) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error creating account",
        description: errorMessage,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!"
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error);
      let errorMessage = "Invalid email or password";
      
      if (error.message.includes("email") || error.message.includes("password")) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error signing in",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'github' | 'linkedin_oidc') => {
    try {
      setLoading(true);
      
      // Ensure we're using the correct provider ID for LinkedIn
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          // Don't use query params for LinkedIn OIDC
          queryParams: provider === 'linkedin_oidc' ? {
            response_type: 'code',
            scope: 'openid profile email'
          } : undefined
        }
      });

      if (error) throw error;
      
      // No toast here since we're being redirected to the OAuth provider
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      
      toast({
        title: `Error signing in with ${provider === 'linkedin_oidc' ? 'LinkedIn' : 'GitHub'}`,
        description: error.message || "An error occurred during authentication",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
