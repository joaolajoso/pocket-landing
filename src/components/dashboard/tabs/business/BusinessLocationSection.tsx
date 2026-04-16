import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import type { OrganizationWebsite, BusinessHour } from '@/types/organizationWebsite';

interface BusinessLocationSectionProps {
  formData: Partial<OrganizationWebsite>;
  onChange: (data: Partial<OrganizationWebsite>) => void;
}

export const BusinessLocationSection = ({ formData, onChange }: BusinessLocationSectionProps) => {
  const [isHoursOpen, setIsHoursOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Morada/Localização
        </Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Rua Exemplo 123, Lisboa"
        />
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label htmlFor="region">Região</Label>
        <Input
          id="region"
          value={formData.region || ''}
          onChange={(e) => onChange({ region: e.target.value })}
          placeholder="Lisboa, Portugal"
        />
      </div>

      {/* Business Hours */}
      <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isHoursOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <BusinessHoursEditor
            hours={formData.business_hours || []}
            onChange={(hours) => onChange({ business_hours: hours })}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
