import { useState, useEffect } from "react";
import pocketcvLogoFull from "@/assets/pocketcv-logo-full.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Warp } from "@paper-design/shaders-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AuthRedirect } from "@/components/onboarding/AuthRedirect";
import { updateOnboardingRecord } from "@/utils/onboardingUtils";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/contexts/ThemeContext";

// Icon components
const IconGoogle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const IconLinkedIn = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#0077B5" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { setTheme } = useTheme();
  
  const {
    signIn,
    signUp,
    signInWithOAuth,
    loading,
    isAuthenticated,
    user,
    updatePassword
  } = useAuth();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);
  
  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.substring(1));
  const defaultTab = searchParams.get('signup') === 'true' ? 'signup' : 'login';
  const onboardingLinkId = searchParams.get('onboarding');
  const invitationToken = searchParams.get('invitation');
  const hasCode = searchParams.get('code') || searchParams.get('token');
  
  const hasRecoveryTokens = location.hash.includes('access_token');
  const isRecoveryMode = hashParams.get('type') === 'recovery' && hasRecoveryTokens;
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset password visibility when switching tabs
  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [activeTab]);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [isProcessingSignup, setIsProcessingSignup] = useState(false);
  const [signupSubmittedEmail, setSignupSubmittedEmail] = useState('');
  
  const [errors, setErrors] = useState({
    login: { email: '', password: '' },
    signup: { name: '', email: '', password: '', confirmPassword: '' },
    forgotPassword: { email: '' },
    resetPassword: { password: '', confirmPassword: '' }
  });

  // Handle password reset flow
  useEffect(() => {
    const handlePasswordReset = async () => {
      if (!isRecoveryMode) return;
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            setResetPasswordError(t.login.resetPassword.invalidLink);
            return;
          }
          
          if (data.session) {
            window.history.replaceState({}, '', '/login?type=recovery');
            setResetPasswordOpen(true);
          }
        } catch (error) {
          setResetPasswordError(t.login.resetPassword.error);
        }
        return;
      }
      
      if (isAuthenticated) {
        setResetPasswordOpen(true);
      }
    };

    handlePasswordReset();
  }, [isRecoveryMode, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !onboardingLinkId && !resetPasswordOpen && !isRecoveryMode) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, onboardingLinkId, resetPasswordOpen, isRecoveryMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === 'signup') {
      params.set('signup', 'true');
    } else {
      params.delete('signup');
    }
    if (onboardingLinkId) {
      params.set('onboarding', onboardingLinkId);
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab, onboardingLinkId]);

  if (isAuthenticated && onboardingLinkId && user && !isProcessingSignup) {
    return <AuthRedirect onboardingLinkId={onboardingLinkId} userId={user.id} />;
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors.login[name as keyof typeof errors.login]) {
      setErrors(prev => ({ ...prev, login: { ...prev.login, [name]: '' } }));
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (errors.signup[name as keyof typeof errors.signup]) {
      setErrors(prev => ({ ...prev, signup: { ...prev.signup, [name]: '' } }));
    }
  };

  const validateLoginForm = () => {
    const newErrors = { email: '', password: '' };
    if (!loginData.email) newErrors.email = t.login.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = t.login.errors.emailInvalid;
    if (!loginData.password) newErrors.password = t.login.errors.passwordRequired;
    setErrors(prev => ({ ...prev, login: newErrors }));
    return !newErrors.email && !newErrors.password;
  };

  const validateSignupForm = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    if (!signupData.name) newErrors.name = t.login.errors.nameRequired;
    if (!signupData.email) newErrors.email = t.login.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = t.login.errors.emailInvalid;
    if (!signupData.password) newErrors.password = t.login.errors.passwordRequired;
    else if (signupData.password.length < 8) newErrors.password = t.login.errors.passwordMin;
    if (!signupData.confirmPassword) newErrors.confirmPassword = t.login.errors.confirmPasswordRequired;
    else if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = t.login.errors.passwordsNoMatch;
    setErrors(prev => ({ ...prev, signup: newErrors }));
    return !Object.values(newErrors).some(error => error);
  };

  const validateForgotPasswordForm = () => {
    let emailError = '';
    if (!forgotPasswordEmail) emailError = t.login.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) emailError = t.login.errors.emailInvalid;
    setErrors(prev => ({ ...prev, forgotPassword: { email: emailError } }));
    return !emailError;
  };

  const validateResetPasswordForm = () => {
    const passwordError = !newPassword ? t.login.errors.passwordRequired : newPassword.length < 8 ? t.login.errors.passwordMin : '';
    const confirmError = !confirmNewPassword ? t.login.errors.confirmPasswordRequired : newPassword !== confirmNewPassword ? t.login.errors.passwordsNoMatch : '';
    setErrors(prev => ({ ...prev, resetPassword: { password: passwordError, confirmPassword: confirmError } }));
    return !passwordError && !confirmError;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast({ title: t.login.errors.invalidCredentials, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    
    setIsProcessingSignup(true);
    const metadata = { name: signupData.name };
    
    let signupResult;
    try {
      signupResult = await signUp(signupData.email, signupData.password, metadata, onboardingLinkId || undefined);
      
      if (signupResult?.error) {
        const errorMessage = signupResult.error.message?.toLowerCase() || '';
        if (errorMessage.includes('already registered') || errorMessage.includes('user already registered') || errorMessage.includes('email already') || signupResult.error.code === 'user_already_exists') {
          toast({ title: "E-mail já registado", description: "Este endereço de e-mail já está associado a uma conta. Tente fazer login ou recupere a sua password.", variant: "destructive" });
          return;
        }
        toast({ title: "Erro no registo", description: signupResult.error.message || "Ocorreu um erro ao criar a conta. Tente novamente.", variant: "destructive" });
        return;
      }
      
      if (invitationToken) {
        try {
          const { data, error } = await supabase.rpc('accept_organization_invitation', { invitation_token_param: invitationToken });
          if (error) throw error;
          toast({ title: "Convite aceite", description: "Foi automaticamente adicionado à organização!" });
        } catch (error) {
          console.error("Error accepting invitation:", error);
        }
      }
      
      setSignupSubmittedEmail(signupData.email);
    } finally {
      setIsProcessingSignup(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgotPasswordForm()) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/login?type=recovery`
      });
      if (error) {
        toast({ title: "Error", description: error.message || "Failed to send password reset email.", variant: "destructive" });
        return;
      }
      setForgotPasswordSubmitted(true);
      toast({ title: "Email enviado", description: "Um email com instruções para redefinir sua senha foi enviado. Por favor verifique também sua pasta de spam." });
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetPasswordForm()) return;
    try {
      setResetPasswordLoading(true);
      setResetPasswordError('');
      const { success, error } = await updatePassword(newPassword);
      if (!success || error) {
        setResetPasswordError(error?.message || "Failed to reset password.");
        return;
      }
      toast({ title: "Password reset successful", description: "Your password has been updated." });
      window.history.replaceState({}, '', window.location.pathname);
      setResetPasswordOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
      await supabase.auth.signOut();
    } catch (error: any) {
      setResetPasswordError(error.message || "An unexpected error occurred.");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const getWelcomeText = () => {
    if (onboardingLinkId) {
      return activeTab === 'login' ? t.login.onboardingLogin : t.login.onboardingSignup;
    }
    return activeTab === 'login' ? t.login.loginSubtitle : t.login.signupSubtitle;
  };

  // Separator component
  const OrSeparator = () => (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground font-medium">ou</span>
      </div>
    </div>
  );

  // Persist context before OAuth redirect
  const handleOAuth = (provider: string) => {
    if (onboardingLinkId) localStorage.setItem('oauth_onboarding_link', onboardingLinkId);
    if (invitationToken) localStorage.setItem('oauth_invitation_token', invitationToken);
    signInWithOAuth(provider);
  };

  // OAuth buttons
  const OAuthButtons = () => (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium border-border hover:bg-accent/50 transition-all"
        onClick={() => handleOAuth('linkedin_oidc')}
        disabled={loading}
      >
        <IconLinkedIn className="h-5 w-5" />
        {loading ? "A conectar..." : "Continuar com LinkedIn"}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium border-border hover:bg-accent/50 transition-all"
        onClick={() => handleOAuth('google')}
        disabled={loading}
      >
        <IconGoogle className="h-5 w-5" />
        {loading ? "A conectar..." : "Continuar com Google"}
      </Button>
    </div>
  );

  const glassInputClass = "rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10";

  // Determine what form to show
  const renderForm = () => {
    // Forgot password submitted confirmation
    if (activeTab === 'login' && forgotPasswordSubmitted) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Verifique o seu email</h3>
            <p className="text-sm text-muted-foreground">
              Enviámos um link de recuperação para <span className="font-medium text-foreground">{forgotPasswordEmail}</span>
            </p>
            <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => setForgotPasswordSubmitted(false)}>
              Voltar ao login
            </Button>
          </div>
        </div>
      );
    }

    // Signup email confirmation
    if (activeTab === 'signup' && signupSubmittedEmail) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Verifique o seu email</h3>
            <p className="text-sm text-muted-foreground">
              Enviámos um link de confirmação para <span className="font-medium text-foreground">{signupSubmittedEmail}</span>
            </p>
            <p className="text-xs text-muted-foreground">Verifique também a pasta de spam.</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              onClick={() => {
                setSignupSubmittedEmail('');
                setSignupData(prev => ({ ...prev, email: '', password: '', confirmPassword: '' }));
              }}
            >
              Email errado? Tentar outro
            </Button>
          </div>
        </div>
      );
    }

    // Forgot password form
    if (activeTab === 'forgot-password') {
      return (
        <form className="space-y-5" onSubmit={handleForgotPassword}>
          <div className="text-center space-y-2 mb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Insira o seu email e enviaremos um link para redefinir a sua password.
            </p>
          </div>

          <div className="animate-element animate-delay-300">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className={glassInputClass}>
              <input
                type="email"
                placeholder="nome@exemplo.com"
                value={forgotPasswordEmail}
                onChange={e => {
                  setForgotPasswordEmail(e.target.value);
                  if (errors.forgotPassword.email) {
                    setErrors(prev => ({ ...prev, forgotPassword: { email: '' } }));
                  }
                }}
                disabled={loading}
                className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground"
              />
            </div>
            {errors.forgotPassword.email && <p className="text-destructive text-xs mt-1">{errors.forgotPassword.email}</p>}
          </div>

          <button type="submit" className="animate-element animate-delay-400 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors" disabled={loading}>
            {loading ? "A enviar..." : "Enviar link de recuperação"}
          </button>
          <button type="button" onClick={() => setActiveTab('login')} className="animate-element animate-delay-500 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </button>
        </form>
      );
    }

    // Login form
    if (activeTab === 'login') {
      return (
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="animate-element animate-delay-300">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className={glassInputClass}>
              <input
                type="email"
                name="email"
                placeholder="nome@exemplo.com"
                value={loginData.email}
                onChange={handleLoginChange}
                disabled={loading}
                className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground"
              />
            </div>
            {errors.login.email && <p className="text-destructive text-xs mt-1">{errors.login.email}</p>}
          </div>

          <div className="animate-element animate-delay-400">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <div className={glassInputClass}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  disabled={loading}
                  className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                  {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                </button>
              </div>
            </div>
            {errors.login.password && <p className="text-destructive text-xs mt-1">{errors.login.password}</p>}
          </div>

          <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
            <span />
            <button type="button" onClick={() => { setForgotPasswordEmail(loginData.email); setActiveTab('forgot-password'); }} className="hover:underline text-primary transition-colors">
              Esqueceu a password?
            </button>
          </div>

          <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </button>

          <div className="animate-element animate-delay-700 relative flex items-center justify-center">
            <span className="w-full border-t border-border"></span>
            <span className="px-4 text-sm text-muted-foreground bg-background absolute">Ou continue com</span>
          </div>

          <div className="space-y-3">
            <button type="button" onClick={() => handleOAuth('linkedin_oidc')} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors" disabled={loading}>
              <IconLinkedIn className="h-5 w-5" />
              Continuar com LinkedIn
            </button>
            <button type="button" onClick={() => handleOAuth('google')} className="animate-element animate-delay-900 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors" disabled={loading}>
              <IconGoogle className="h-5 w-5" />
              Continuar com Google
            </button>
          </div>

          <p className="animate-element animate-delay-1000 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <button type="button" onClick={() => setActiveTab('signup')} className="text-primary hover:underline font-semibold transition-colors">Criar conta</button>
          </p>
        </form>
      );
    }

    // Signup form
    return (
      <form className="space-y-5" onSubmit={handleSignup}>
        <div className="animate-element animate-delay-300">
          <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
          <div className={glassInputClass}>
            <input
              name="name"
              type="text"
              placeholder="João Silva"
              value={signupData.name}
              onChange={handleSignupChange}
              disabled={loading}
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground"
            />
          </div>
          {errors.signup.name && <p className="text-destructive text-xs mt-1">{errors.signup.name}</p>}
        </div>

        <div className="animate-element animate-delay-400">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <div className={glassInputClass}>
            <input
              name="email"
              type="email"
              placeholder="nome@exemplo.com"
              value={signupData.email}
              onChange={handleSignupChange}
              disabled={loading}
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground"
            />
          </div>
          {errors.signup.email && <p className="text-destructive text-xs mt-1">{errors.signup.email}</p>}
        </div>

        <div className="animate-element animate-delay-500">
          <label className="text-sm font-medium text-muted-foreground">Password</label>
          <div className={glassInputClass}>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={signupData.password}
                onChange={handleSignupChange}
                disabled={loading}
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center" aria-label={showPassword ? "Esconder password" : "Mostrar password"}>
                {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
              </button>
            </div>
          </div>
          {errors.signup.password && <p className="text-destructive text-xs mt-1">{errors.signup.password}</p>}
        </div>

        <div className="animate-element animate-delay-600">
          <label className="text-sm font-medium text-muted-foreground">Confirmar Password</label>
          <div className={glassInputClass}>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                disabled={loading}
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center" aria-label={showConfirmPassword ? "Esconder password" : "Mostrar password"}>
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
              </button>
            </div>
          </div>
          {errors.signup.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.signup.confirmPassword}</p>}
        </div>

        <button type="submit" className="animate-element animate-delay-700 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors" disabled={loading}>
          {loading ? "A criar conta..." : "Criar Conta"}
        </button>

        <div className="animate-element animate-delay-800 relative flex items-center justify-center">
          <span className="w-full border-t border-border"></span>
          <span className="px-4 text-sm text-muted-foreground bg-background absolute">Ou continue com</span>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={() => handleOAuth('linkedin_oidc')} className="animate-element animate-delay-900 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors" disabled={loading}>
            <IconLinkedIn className="h-5 w-5" />
            Continuar com LinkedIn
          </button>
          <button type="button" onClick={() => handleOAuth('google')} className="animate-element animate-delay-1000 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors" disabled={loading}>
            <IconGoogle className="h-5 w-5" />
            Continuar com Google
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          Ao criar conta, aceita os nossos{" "}
          <Link to="/terms" className="text-primary hover:underline font-medium">Termos de Serviço</Link>{" "}
          e a{" "}
          <Link to="/privacy" className="text-primary hover:underline font-medium">Política de Privacidade</Link>.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button type="button" onClick={() => setActiveTab('login')} className="text-primary hover:underline font-semibold transition-colors">Entrar</button>
        </p>
      </form>
    );
  };

  return (
    <>
      <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw]">
        {/* Left column: form */}
        <section className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Top navigation */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {t.login.buttons.backToLogin}
              </Link>
              <LanguageSwitcher />
            </div>


            <div className="flex flex-col gap-6">
              <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight text-foreground">
                {activeTab === 'login' ? t.login.welcomeBack : activeTab === 'signup' ? t.login.createAccount : 'Recuperar Password'}
              </h1>
              <p className="animate-element animate-delay-200 text-muted-foreground">
                {getWelcomeText()}
              </p>

              {onboardingLinkId && (
                <div className="animate-element animate-delay-200 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Cartão: {onboardingLinkId}
                </div>
              )}

              {renderForm()}
            </div>
          </div>
        </section>

        {/* Right column: Warp shader */}
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl overflow-hidden">
            <Warp
              style={{ height: "100%", width: "100%" }}
              proportion={0.45}
              softness={1}
              distortion={0.25}
              swirl={0.8}
              swirlIterations={10}
              shape="checks"
              shapeScale={0.1}
              scale={1}
              rotation={0}
              speed={0.8}
              colors={[
                "hsl(270, 70%, 35%)",
                "hsl(280, 80%, 50%)",
                "hsl(265, 75%, 45%)",
                "hsl(290, 85%, 40%)",
              ]}
            />
          </div>
        </section>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redefinir password</DialogTitle>
            <DialogDescription>Crie uma nova password para a sua conta.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  if (errors.resetPassword.password) {
                    setErrors(prev => ({ ...prev, resetPassword: { ...prev.resetPassword, password: '' } }));
                  }
                }}
              />
              {errors.resetPassword.password && <p className="text-destructive text-xs">{errors.resetPassword.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmar Nova Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={e => {
                  setConfirmNewPassword(e.target.value);
                  if (errors.resetPassword.confirmPassword) {
                    setErrors(prev => ({ ...prev, resetPassword: { ...prev.resetPassword, confirmPassword: '' } }));
                  }
                }}
              />
              {errors.resetPassword.confirmPassword && <p className="text-destructive text-xs">{errors.resetPassword.confirmPassword}</p>}
            </div>
            {resetPasswordError && (
              <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-lg">{resetPasswordError}</div>
            )}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetPasswordOpen(false);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                disabled={resetPasswordLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={resetPasswordLoading} className="bg-primary hover:bg-primary/90">
                {resetPasswordLoading ? "A atualizar..." : "Redefinir Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;
