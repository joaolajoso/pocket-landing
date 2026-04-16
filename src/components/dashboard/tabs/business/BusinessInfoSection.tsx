import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadButton } from '@/components/UploadButton';
import type { OrganizationWebsite } from '@/types/organizationWebsite';

interface BusinessInfoSectionProps {
  formData: Partial<OrganizationWebsite>;
  onChange: (data: Partial<OrganizationWebsite>) => void;
  onLogoUpload?: (file: File) => void;
  onBannerUpload?: (file: File) => void;
  showPriceRange?: boolean;
  isCreating?: boolean;
}

const INDUSTRIES = [
  'Alimentação',
  'Artesanato',
  'Beleza & Bem-estar',
  'Comércio',
  'Consultoria',
  'Educação',
  'Hotelaria',
  'Imobiliário',
  'Restauração',
  'Saúde',
  'Serviços',
  'Tecnologia',
  'Turismo',
  'Outro',
];

export const BusinessInfoSection = ({
  formData,
  onChange,
  onLogoUpload,
  onBannerUpload,
  showPriceRange = false,
  isCreating = false,
}: BusinessInfoSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Logo and Banner */}
      {!isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="h-16 w-16 object-contain rounded-lg border bg-white p-2" 
                />
              )}
              {onLogoUpload && (
                <UploadButton
                  onUpload={onLogoUpload}
                  uploadText={formData.logo_url ? "Alterar" : "Carregar Logo"}
                  accept="image/*"
                  maxSize={5}
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Banner de Capa</Label>
            <div className="flex items-center gap-4">
              {formData.banner_image_url && (
                <img 
                  src={formData.banner_image_url} 
                  alt="Banner" 
                  className="h-16 w-32 object-cover rounded-lg border" 
                />
              )}
              {onBannerUpload && (
                <UploadButton
                  onUpload={onBannerUpload}
                  uploadText={formData.banner_image_url ? "Alterar" : "Carregar Banner"}
                  accept="image/*"
                  maxSize={10}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subdomain - only on creation */}
      {isCreating && (
        <div className="space-y-2">
          <Label htmlFor="subdomain">URL da Página *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">pocketcv.pt/c/</span>
            <Input
              id="subdomain"
              value={formData.subdomain || ''}
              onChange={(e) => onChange({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="nome-empresa"
              className="flex-1"
            />
          </div>
        </div>
      )}

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="company_name">Nome da Empresa *</Label>
        <Input
          id="company_name"
          value={formData.company_name || ''}
          onChange={(e) => onChange({ company_name: e.target.value })}
          placeholder="Nome da sua empresa"
        />
      </div>

      {/* Industry and Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Setor/Categoria</Label>
          <Select
            value={formData.industry || ''}
            onValueChange={(value) => onChange({ industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showPriceRange && (
          <div className="space-y-2">
            <Label htmlFor="price_range">Faixa de Preço</Label>
            <Select
              value={formData.price_range || ''}
              onValueChange={(value) => onChange({ price_range: value as '€' | '€€' | '€€€' | '€€€€' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="€">€ - Económico</SelectItem>
                <SelectItem value="€€">€€ - Moderado</SelectItem>
                <SelectItem value="€€€">€€€ - Premium</SelectItem>
                <SelectItem value="€€€€">€€€€ - Luxo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Slogan */}
      <div className="space-y-2">
        <Label htmlFor="slogan">Slogan/Tagline</Label>
        <Input
          id="slogan"
          value={formData.slogan || ''}
          onChange={(e) => onChange({ slogan: e.target.value })}
          placeholder="Uma frase curta que define o seu negócio"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Negócio</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Descreva o seu negócio, missão, e o que oferece aos clientes..."
          rows={4}
        />
      </div>
    </div>
  );
};
