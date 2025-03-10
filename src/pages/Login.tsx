
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Github, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get signup parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('signup') === 'true' ? 'signup' : 'login';
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      confirmPassword: ''
    }
  });

  // Update the URL when tab changes without full page reload
  useEffect(() => {
    const newUrl = activeTab === 'signup' 
      ? `${window.location.pathname}?signup=true`
      : window.location.pathname;
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
      confirmPassword: ''
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
    
    setErrors(prev => ({
      ...prev,
      signup: newErrors
    }));
    
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    
    try {
      // Here you would normally make an API call to authenticate
      // For this demo, we'll simulate a successful login
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Logged in successfully",
          description: "Welcome back to PocketCV!",
        });
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) return;
    
    setIsLoading(true);
    
    try {
      // Here you would normally make an API call to register
      // For this demo, we'll simulate a successful registration
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Account created successfully",
          description: "Welcome to PocketCV!",
        });
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Sign up failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
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
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    name="email"
                    placeholder="your@email.com" 
                    value={loginData.email}
                    onChange={handleLoginChange}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  {errors.login.password && (
                    <p className="text-destructive text-sm">{errors.login.password}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
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
                  <Button variant="outline" type="button" disabled={isLoading} className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" type="button" disabled={isLoading} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input 
                    id="signup-name" 
                    name="name"
                    placeholder="John Doe" 
                    value={signupData.name}
                    onChange={handleSignupChange}
                    disabled={isLoading}
                  />
                  {errors.signup.name && (
                    <p className="text-destructive text-sm">{errors.signup.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    name="email"
                    placeholder="your@email.com" 
                    value={signupData.email}
                    onChange={handleSignupChange}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  {errors.signup.confirmPassword && (
                    <p className="text-destructive text-sm">{errors.signup.confirmPassword}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
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
                  <Button variant="outline" type="button" disabled={isLoading} className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" type="button" disabled={isLoading} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
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
