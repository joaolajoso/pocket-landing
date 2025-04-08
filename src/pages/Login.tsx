import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Github, Mail, Linkedin, Building2, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, loading, isAuthenticated } = useAuth();
  
  // Get signup parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('signup') === 'true' ? 'signup' : 'login';
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [accountType, setAccountType] = useState('personal');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companySize: ''
  });
  
  const [errors, setErrors] = useState({
    login: {
      email: '',
      password: ''
    },
    signup: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      companySize: ''
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Update the URL when tab changes without full page reload
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === 'signup') {
      params.set('signup', 'true');
    } else {
      params.delete('signup');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors.login[name as keyof typeof errors.login]) {
      setErrors(prev => ({
        ...prev,
        login: {
          ...prev.login,
          [name]: ''
        }
      }));
    }
  };
  
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors.signup[name as keyof typeof errors.signup]) {
      setErrors(prev => ({
        ...prev,
        signup: {
          ...prev.signup,
          [name]: ''
        }
      }));
    }
  };
  
  const validateLoginForm = () => {
    const newErrors = {
      email: '',
      password: ''
    };
    
    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(prev => ({
      ...prev,
      login: newErrors
    }));
    
    return !newErrors.email && !newErrors.password;
  };
  
  const validateSignupForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      companySize: ''
    };
    
    if (!signupData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (accountType === 'business') {
      if (!signupData.companyName) {
        newErrors.companyName = 'Company name is required';
      }
      
      if (!signupData.companySize) {
        newErrors.companySize = 'Company size is required';
      }
    }
    
    setErrors(prev => ({
      ...prev,
      signup: newErrors
    }));
    
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    await signIn(loginData.email, loginData.password);
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) return;
    
    // Pass name as metadata for the trigger to use
    const metadata = { name: signupData.name };
    
    await signUp(signupData.email, signupData.password, metadata);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-secondary/30">
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-4 left-4 gap-2"
        asChild
      >
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="mb-8 text-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Pocket</span>CV
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-lg animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' 
              ? 'Sign in to access your PocketCV dashboard' 
              : 'Join PocketCV to create your professional landing page'}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mx-auto max-w-xs mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-4 mb-6">
                  <Button 
                    type="button"
                    variant={accountType === 'personal' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setAccountType('personal')}
                  >
                    <User className="h-4 w-4" />
                    Personal
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={accountType === 'business' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setAccountType('business')}
                  >
                    <Building2 className="h-4 w-4" />
                    Business
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    name="email"
                    placeholder="your@email.com" 
                    value={loginData.email}
                    onChange={handleLoginChange}
                    disabled={loading}
                  />
                  {errors.login.email && (
                    <p className="text-destructive text-sm">{errors.login.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="login-password" 
                    type="password" 
                    name="password"
                    placeholder="••••••••" 
                    value={loginData.password}
                    onChange={handleLoginChange}
                    disabled={loading}
                  />
                  {errors.login.password && (
                    <p className="text-destructive text-sm">{errors.login.password}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full bg-pocketcv-purple hover:bg-pocketcv-purple/90" disabled={loading}>
                  {loading ? "Signing in..." : `Sign In${accountType === 'business' ? ' to Business Account' : ''}`}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" disabled={loading} className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" type="button" disabled={loading} className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-4 mb-6">
                  <Button 
                    type="button"
                    variant={accountType === 'personal' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setAccountType('personal')}
                  >
                    <User className="h-4 w-4" />
                    Personal
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={accountType === 'business' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setAccountType('business')}
                  >
                    <Building2 className="h-4 w-4" />
                    Business
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{accountType === 'business' ? 'Admin Name' : 'Full Name'}</Label>
                  <Input 
                    id="signup-name" 
                    name="name"
                    placeholder="John Doe" 
                    value={signupData.name}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.signup.name && (
                    <p className="text-destructive text-sm">{errors.signup.name}</p>
                  )}
                </div>
                
                {accountType === 'business' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-company-name">Company Name</Label>
                      <Input 
                        id="signup-company-name" 
                        name="companyName"
                        placeholder="Acme Inc." 
                        value={signupData.companyName}
                        onChange={handleSignupChange}
                        disabled={loading}
                      />
                      {errors.signup.companyName && (
                        <p className="text-destructive text-sm">{errors.signup.companyName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-company-size">Company Size</Label>
                      <Select
                        disabled={loading}
                        value={signupData.companySize}
                        onValueChange={(value) => {
                          setSignupData(prev => ({...prev, companySize: value}));
                        }}
                      >
                        <SelectTrigger id="signup-company-size">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501+">501+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.signup.companySize && (
                        <p className="text-destructive text-sm">{errors.signup.companySize}</p>
                      )}
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    name="email"
                    placeholder="your@email.com" 
                    value={signupData.email}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.signup.email && (
                    <p className="text-destructive text-sm">{errors.signup.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    name="password"
                    placeholder="••••••••" 
                    value={signupData.password}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.signup.password && (
                    <p className="text-destructive text-sm">{errors.signup.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input 
                    id="signup-confirm-password" 
                    type="password" 
                    name="confirmPassword"
                    placeholder="••••••••" 
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.signup.confirmPassword && (
                    <p className="text-destructive text-sm">{errors.signup.confirmPassword}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full bg-pocketcv-purple hover:bg-pocketcv-purple/90" disabled={loading}>
                  {loading ? "Creating Account..." : `Create ${accountType === 'business' ? 'Business ' : ''}Account`}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" disabled={loading} className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" type="button" disabled={loading} className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
                
                <p className="text-center text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="underline hover:text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-center pt-2 pb-6">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setActiveTab('signup')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setActiveTab('login')}
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
