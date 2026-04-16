import { useState, useEffect } from "react";
import { CreditCard, Smartphone, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useOrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";
import { useRolePermissions } from "@/hooks/organization/useRolePermissions";

// PIX Icon SVG
const PixIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 512 512" 
    className={className}
    fill="currentColor"
  >
    <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.9 231.1 518.9 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C257.1 224.4 247.9 224.4 242.4 218.9L165.7 142.2C151.5 128 132.6 120.2 112.6 120.2H103.3L200.4 23.1C230.7-7.2 279.9-7.2 310.2 23.1L407.3 120.2H392.6C372.6 120.2 353.7 128 339.5 142.2L262.5 218.9z" />
    <path d="M112.6 142.7C126.4 142.7 139.1 148.3 148.7 157.9L225.4 234.6C233.6 242.8 244.8 247.3 256.3 247.3C267.9 247.3 279.1 242.8 287.3 234.6L364 157.9C373.6 148.3 386.3 142.7 400.1 142.7H407.7L310.6 45.6C289.3 24.4 255.6 24.4 234.4 45.6L137.3 142.7H112.6zM400.1 368.8C386.3 368.8 373.6 363.2 364 353.6L287.3 276.9C270.5 260.1 241.8 260.1 225 276.9L148.3 353.6C138.7 363.2 126 368.8 112.2 368.8H137.3L234.4 465.9C255.6 487.1 289.3 487.1 310.6 465.9L407.7 368.8H400.1z" />
    <path d="M488.6 200.4L434.4 146.3C432.2 147.4 429.8 148.1 427.2 148.1H400.1C390.5 148.1 381.6 152.3 374.9 159L298.2 235.7C286.9 247 272.1 253.2 256.3 253.2C240.5 253.2 225.7 247 214.4 235.7L137.7 159C131 152.3 122.1 148.1 112.5 148.1H85.4C82.8 148.1 80.4 147.4 78.2 146.3L23.1 200.4C-7.2 230.7-7.2 279.9 23.1 310.2L78.2 365.3C80.4 364.2 82.8 363.5 85.4 363.5H112.5C122.1 363.5 131 359.3 137.7 352.6L214.4 275.9C237 253.3 275.5 253.3 298.2 275.9L374.9 352.6C381.6 359.3 390.5 363.5 400.1 363.5H427.2C429.8 363.5 432.2 362.8 434.4 361.7L488.6 310.2C518.9 279.9 518.9 230.7 488.6 200.4z" />
  </svg>
);

// MB WAY Icon
const MbWayIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="currentColor"
  >
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
    <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">MB</text>
  </svg>
);

// Validation helpers
const validatePixKey = (key: string): boolean => {
  if (!key) return false;
  const cleanKey = key.replace(/\D/g, '');
  
  // CPF: 11 digits
  if (/^\d{11}$/.test(cleanKey)) return true;
  
  // CNPJ: 14 digits
  if (/^\d{14}$/.test(cleanKey)) return true;
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return true;
  
  // Brazilian phone: +55 followed by 10-11 digits
  if (/^\+55\d{10,11}$/.test(key.replace(/\D/g, '').replace(/^55/, '+55'))) return true;
  
  // Random key: 32 alphanumeric characters
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)) return true;
  
  return key.length >= 5; // Accept other formats loosely
};

const validateMbWayPhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/\D/g, '');
  // Portuguese phone: 9 digits starting with 9
  return /^9\d{8}$/.test(cleanPhone);
};

const formatPhoneForMbWay = (phone: string): string => {
  // Extract last 9 digits if phone starts with country code
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length >= 9) {
    const last9 = cleanPhone.slice(-9);
    if (last9.startsWith('9')) return last9;
  }
  return cleanPhone;
};

const PaymentMethodCard = () => {
  const { toast } = useToast();
  const { organization } = useOrganization();
  const { website, updateWebsite } = useOrganizationWebsite(organization?.id);
  const { isOwner, loading: roleLoading } = useRolePermissions(organization?.id);
  
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'mbway' | null>(null);
  const [paymentKey, setPaymentKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from website data
  useEffect(() => {
    if (website) {
      setPaymentMethod(website.payment_method || null);
      setPaymentKey(website.payment_key || '');
    }
  }, [website]);

  const handleUsePhone = () => {
    if (!website?.phone) {
      toast({
        title: "Telefone não configurado",
        description: "Configure o telefone da empresa na aba Business primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'mbway') {
      const formatted = formatPhoneForMbWay(website.phone);
      if (validateMbWayPhone(formatted)) {
        setPaymentKey(formatted);
        setError(null);
      } else {
        toast({
          title: "Formato inválido",
          description: "O telefone cadastrado não é um número português válido para MB WAY.",
          variant: "destructive",
        });
      }
    } else if (paymentMethod === 'pix') {
      // For PIX, use full phone with +55
      const cleanPhone = website.phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('55') || cleanPhone.length === 11 || cleanPhone.length === 10) {
        const pixPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
        setPaymentKey(pixPhone);
        setError(null);
      } else {
        toast({
          title: "Formato inválido",
          description: "O telefone cadastrado não parece ser um número brasileiro válido para PIX.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!website?.id) return;

    // Validate based on method
    if (paymentMethod === 'pix' && paymentKey && !validatePixKey(paymentKey)) {
      setError('Chave PIX inválida. Use CPF, CNPJ, email, telefone (+55) ou chave aleatória.');
      return;
    }

    if (paymentMethod === 'mbway' && paymentKey && !validateMbWayPhone(paymentKey)) {
      setError('Número MB WAY inválido. Use 9 dígitos começando por 9 (ex: 912345678).');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateWebsite(website.id, {
        payment_method: paymentMethod,
        payment_key: paymentKey || null,
        show_payment_method: paymentMethod && paymentKey ? website.show_payment_method : false,
      });

      toast({
        title: "Guardado",
        description: "Método de pagamento atualizado com sucesso.",
      });
    } catch (err) {
      console.error('Error saving payment method:', err);
      toast({
        title: "Erro",
        description: "Não foi possível guardar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!website?.id) return;

    setSaving(true);
    try {
      await updateWebsite(website.id, {
        payment_method: null,
        payment_key: null,
        show_payment_method: false,
      });

      setPaymentMethod(null);
      setPaymentKey('');
      setError(null);

      toast({
        title: "Removido",
        description: "Método de pagamento removido.",
      });
    } catch (err) {
      console.error('Error clearing payment method:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!organization || !website || roleLoading) return null;

  // Only the owner can manage payment methods
  if (!isOwner) return null;

  return (
    <div className="mb-4 md:mb-6">
      <div className="mb-3 px-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Pagamento Móvel
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure PIX (Brasil) ou MB WAY (Portugal) para receber pagamentos
        </p>
      </div>
      <div className="space-y-4">
        {/* Method Selection */}
        <RadioGroup
          value={paymentMethod || ''}
          onValueChange={(value) => {
            setPaymentMethod(value as 'pix' | 'mbway');
            setPaymentKey('');
            setError(null);
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
              <PixIcon className="w-4 h-4 text-[#32BCAD]" />
              PIX
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mbway" id="mbway" />
            <Label htmlFor="mbway" className="flex items-center gap-2 cursor-pointer">
              <MbWayIcon className="w-4 h-4 text-[#CC0000]" />
              MB WAY
            </Label>
          </div>
        </RadioGroup>

        {/* Key Input */}
        {paymentMethod && (
          <div className="space-y-2">
            <Label htmlFor="payment-key" className="text-sm">
              {paymentMethod === 'pix' ? 'Chave PIX' : 'Número MB WAY'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="payment-key"
                value={paymentKey}
                onChange={(e) => {
                  setPaymentKey(e.target.value);
                  setError(null);
                }}
                placeholder={
                  paymentMethod === 'pix' 
                    ? 'CPF, email, telefone ou chave aleatória' 
                    : '912345678'
                }
                className={error ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleUsePhone}
                disabled={!website?.phone}
                title="Usar telemóvel cadastrado"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {paymentMethod === 'pix' 
                ? 'Aceita CPF, CNPJ, email, telefone (+55) ou chave aleatória'
                : 'Número português de 9 dígitos (começa por 9)'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={saving || !paymentMethod}
            size="sm"
          >
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
          {(paymentMethod || paymentKey) && (
            <Button 
              onClick={handleClear} 
              variant="outline"
              size="sm"
              disabled={saving}
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Info about visibility */}
        {paymentMethod && paymentKey && (
          <p className="text-xs text-muted-foreground">
            💡 Ative a visibilidade na aba "Página Pública" para mostrar na página pública.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodCard;
