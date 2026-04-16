import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, ArrowLeft, Building2, User } from 'lucide-react';
import GoogleButton from '@/components/auth/GoogleButton';
import LinkedInButton from '@/components/auth/LinkedInButton';

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const companySizes = [
  { value: 'startup', label: '1-10 colaboradores' },
  { value: 'small', label: '11-50 colaboradores' },
  { value: 'medium', label: '51-200 colaboradores' },
  { value: 'large', label: '201-500 colaboradores' },
  { value: 'enterprise', label: '500+ colaboradores' },
];

const EventRegistrationForm = ({ eventId, onSuccess, onBackToLogin }: EventRegistrationFormProps) => {
  const { signUp, signUpBusiness } = useAuth();
  const { toast } = useToast();
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Personal fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Business fields
  const [adminName, setAdminName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');

  // Checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const validateForm = (): string | null => {
    if (accountType === 'personal') {
      if (!fullName.trim()) return 'O nome é obrigatório';
      if (fullName.trim().length > 100) return 'O nome deve ter menos de 100 caracteres';
    } else {
      if (!adminName.trim()) return 'O nome do administrador é obrigatório';
      if (adminName.trim().length > 100) return 'O nome deve ter menos de 100 caracteres';
      if (!companyName.trim()) return 'O nome da empresa é obrigatório';
      if (companyName.trim().length > 200) return 'O nome da empresa deve ter menos de 200 caracteres';
      if (!companySize) return 'Seleciona o tamanho da empresa';
    }

    if (!email.trim()) return 'O email é obrigatório';
    if (email.trim().length > 255) return 'O email deve ter menos de 255 caracteres';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Email inválido';

    if (!password) return 'A password é obrigatória';
    if (password.length < 6) return 'A password deve ter pelo menos 6 caracteres';
    if (password !== confirmPassword) return 'As passwords não coincidem';

    if (!acceptTerms) return 'Deves aceitar os Termos de Serviço';
    if (!acceptPrivacy) return 'Deves aceitar a Política de Privacidade';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Dados inválidos",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let result;

      if (accountType === 'personal') {
        result = await signUp(email.trim(), password, {
          name: fullName.trim(),
          account_type: 'personal',
          event_registration: eventId,
        });
      } else {
        result = await signUpBusiness(email.trim(), password, {
          name: adminName.trim(),
          companyName: companyName.trim(),
          companySize,
        });
      }

      if (result.error) {
        const msg = result.error.message || 'Erro ao criar conta';
        toast({
          title: "Erro no registo",
          description: msg.includes('already registered') 
            ? 'Este email já está registado. Tenta fazer login.' 
            : msg,
          variant: "destructive",
        });
      } else {
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={onBackToLogin} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold">Criar conta</h2>
          <p className="text-sm text-muted-foreground">Regista-te para participar no evento</p>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-2">
        <GoogleButton />
        <LinkedInButton />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou com email</span>
        </div>
      </div>

      {/* Account Type Tabs */}
      <Tabs value={accountType} onValueChange={(v) => setAccountType(v as 'personal' | 'business')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <TabsContent value="personal" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Nome completo</Label>
              <Input
                id="reg-name"
                placeholder="O teu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="business" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-admin-name">Nome do administrador</Label>
              <Input
                id="reg-admin-name"
                placeholder="O teu nome"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                maxLength={100}
                required={accountType === 'business'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-company">Nome da empresa</Label>
              <Input
                id="reg-company"
                placeholder="Nome da empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={200}
                required={accountType === 'business'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-size">Tamanho da empresa</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Common fields */}
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordToggle />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Confirmar password</Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repetir password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Legal Checkboxes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                Li e aceito os{' '}
                <a href="/terms" target="_blank" className="text-primary underline hover:no-underline">
                  Termos de Serviço
                </a>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
              />
              <label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
                Li e aceito a{' '}
                <a href="/privacy" target="_blank" className="text-primary underline hover:no-underline">
                  Política de Privacidade
                </a>
                . Os dados são geridos pela PocketCV e pela entidade organizadora do evento, em conformidade com o RGPD.
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading || !acceptTerms || !acceptPrivacy}>
            <UserPlus className="h-4 w-4" />
            {loading ? 'A criar conta...' : 'Criar conta'}
          </Button>
        </form>
      </Tabs>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Já tens conta?{' '}
          <button
            onClick={onBackToLogin}
            className="text-primary font-medium hover:underline"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
