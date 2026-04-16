import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import type { OrganizationWebsite } from '@/types/organizationWebsite';

interface BusinessContactSectionProps {
  formData: Partial<OrganizationWebsite>;
  onChange: (data: Partial<OrganizationWebsite>) => void;
}

export const BusinessContactSection = ({ formData, onChange }: BusinessContactSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Telefone
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+351 912 345 678"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="contacto@empresa.pt"
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Label>
        <Input
          id="whatsapp"
          type="tel"
          value={formData.whatsapp || ''}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
          placeholder="+351 912 345 678"
        />
        <p className="text-xs text-muted-foreground">
          Inclua o código do país para o botão WhatsApp funcionar corretamente
        </p>
      </div>
    </div>
  );
};
