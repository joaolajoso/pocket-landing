import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Globe, Instagram, Facebook } from 'lucide-react';
import type { OrganizationWebsite } from '@/types/organizationWebsite';

interface BusinessSocialSectionProps {
  formData: Partial<OrganizationWebsite>;
  onChange: (data: Partial<OrganizationWebsite>) => void;
}

export const BusinessSocialSection = ({ formData, onChange }: BusinessSocialSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website_url" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website
        </Label>
        <Input
          id="website_url"
          type="url"
          value={formData.website_url || ''}
          onChange={(e) => onChange({ website_url: e.target.value })}
          placeholder="https://www.suaempresa.pt"
        />
      </div>

      {/* Instagram */}
      <div className="space-y-2">
        <Label htmlFor="instagram" className="flex items-center gap-2">
          <Instagram className="h-4 w-4" />
          Instagram
        </Label>
        <div className="flex items-center">
          <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
            instagram.com/
          </span>
          <Input
            id="instagram"
            value={formData.instagram || ''}
            onChange={(e) => onChange({ instagram: e.target.value.replace('@', '') })}
            placeholder="suaempresa"
            className="rounded-l-none"
          />
        </div>
      </div>

      {/* Facebook */}
      <div className="space-y-2">
        <Label htmlFor="facebook" className="flex items-center gap-2">
          <Facebook className="h-4 w-4" />
          Facebook
        </Label>
        <div className="flex items-center">
          <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
            facebook.com/
          </span>
          <Input
            id="facebook"
            value={formData.facebook || ''}
            onChange={(e) => onChange({ facebook: e.target.value })}
            placeholder="suaempresa"
            className="rounded-l-none"
          />
        </div>
      </div>
    </div>
  );
};
