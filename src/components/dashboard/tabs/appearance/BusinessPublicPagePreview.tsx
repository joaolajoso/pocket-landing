import { useState, useMemo, useEffect } from "react";
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  MessageCircle,
  CheckCircle2,
  Building2,
  ExternalLink,
  Briefcase,
  Package,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { getBusinessTheme, BUSINESS_COLOR_PRESETS } from "@/components/business-public/businessColorThemes";
import type { OrganizationWebsite, BusinessHour, Service, Product } from "@/types/organizationWebsite";
import { cn } from "@/lib/utils";

interface BusinessPublicPagePreviewProps {
  className?: string;
}

const BusinessPublicPagePreview = ({ className }: BusinessPublicPagePreviewProps) => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [website, setWebsite] = useState<OrganizationWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customHex, setCustomHex] = useState("");
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);

  // Fetch organization website data
  useEffect(() => {
    const fetchWebsite = async () => {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organization_websites')
          .select('*')
          .eq('organization_id', organization.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching website:', error);
        }

        if (data) {
          // Cast with unknown to handle complex JSON types
          const websiteData = {
            ...data,
            business_type: (data.business_type || 'products') as 'products' | 'services',
            business_hours: Array.isArray(data.business_hours) 
              ? data.business_hours as unknown as BusinessHour[]
              : [],
            products: Array.isArray(data.products) ? data.products as unknown as any[] : [],
            services: Array.isArray(data.services) ? data.services as unknown as any[] : [],
            amenities: Array.isArray(data.amenities) ? data.amenities as unknown as any[] : [],
          } as unknown as OrganizationWebsite;
          setWebsite(websiteData);
          setCustomHex(data.primary_color || '#0ea5e9');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [organization?.id]);

  // Get theme from current color
  const theme = useMemo(() => {
    return getBusinessTheme(website?.primary_color || '#0ea5e9');
  }, [website?.primary_color]);

  // Check if currently open
  const isCurrentlyOpen = useMemo(() => {
    if (!website?.business_hours || website.business_hours.length === 0) return null;
    
    const now = new Date();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const todayName = days[now.getDay()];
    
    const todayHours = website.business_hours.find(
      (h: BusinessHour) => h.day.toLowerCase() === todayName.toLowerCase()
    );
    
    if (!todayHours || todayHours.isClosed) return false;
    if (todayHours.hours.toLowerCase().includes('fechado')) return false;
    
    return true;
  }, [website?.business_hours]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Update website color
  const handleColorChange = async (color: string) => {
    if (!website?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organization_websites')
        .update({ primary_color: color, accent_color: color })
        .eq('id', website.id);

      if (error) throw error;

      setWebsite(prev => prev ? { ...prev, primary_color: color, accent_color: color } : null);
      setCustomHex(color);
      
      toast({
        title: "Cor atualizada",
        description: "A cor do tema foi guardada com sucesso.",
      });
    } catch (err) {
      console.error('Error updating color:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a cor.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update visibility settings using proper flags
  const handleVisibilityChange = async (field: 'show_phone' | 'show_email' | 'show_whatsapp' | 'show_payment_method', enabled: boolean) => {
    if (!website?.id) return;

    // Optimistic update for instant feedback
    setWebsite(prev => prev ? { ...prev, [field]: enabled } : null);
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('organization_websites')
        .update({ [field]: enabled })
        .eq('id', website.id);

      if (error) throw error;
      
      toast({
        title: enabled ? "Visibilidade ativada" : "Visibilidade desativada",
        description: `O contacto foi ${enabled ? 'mostrado' : 'ocultado'} da página pública.`,
      });
    } catch (err) {
      console.error('Error updating visibility:', err);
      // Revert on error
      setWebsite(prev => prev ? { ...prev, [field]: !enabled } : null);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visibilidade.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-pulse space-y-4">
          <div className="w-24 h-24 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Página Business não configurada</h3>
        <p className="text-muted-foreground text-sm">
          Configure a sua página business na aba "Business".
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-6 w-full max-w-md", className)}>
      {/* Color Picker Section */}
      <div className="w-full space-y-4 p-4 rounded-xl bg-muted/50">
        <h3 className="font-semibold text-sm">Cor do Tema Business</h3>
        
        {/* Color Presets */}
        <div className="flex flex-wrap gap-2">
          {BUSINESS_COLOR_PRESETS.slice(0, 8).map((preset) => (
            <button
              key={preset.hex}
              onClick={() => handleColorChange(preset.hex)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                website.primary_color === preset.hex 
                  ? "border-foreground ring-2 ring-offset-2 ring-primary" 
                  : "border-transparent"
              )}
              style={{ backgroundColor: preset.hex }}
              title={preset.name}
              disabled={saving}
            />
          ))}
        </div>

        {/* Custom HEX Input */}
        <div className="flex gap-2">
          <Input
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            placeholder="#0ea5e9"
            className="font-mono text-sm"
            maxLength={7}
          />
          <Button 
            size="sm" 
            onClick={() => handleColorChange(customHex)}
            disabled={saving || !customHex.match(/^#[0-9A-Fa-f]{6}$/)}
          >
            Aplicar
          </Button>
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="w-full space-y-3 p-4 rounded-xl bg-muted/50">
        <h3 className="font-semibold text-sm">Visibilidade na Página</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="phone-visible" className="text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Telefone
            {!website.phone && <span className="text-xs text-muted-foreground">(não preenchido)</span>}
          </Label>
          <Switch 
            id="phone-visible"
            checked={website.show_phone !== false}
            onCheckedChange={(checked) => handleVisibilityChange('show_phone', checked)}
            disabled={saving || !website.phone}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="email-visible" className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email
            {!website.email && <span className="text-xs text-muted-foreground">(não preenchido)</span>}
          </Label>
          <Switch 
            id="email-visible"
            checked={website.show_email !== false}
            onCheckedChange={(checked) => handleVisibilityChange('show_email', checked)}
            disabled={saving || !website.email}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="whatsapp-visible" className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            WhatsApp
            {!website.whatsapp && <span className="text-xs text-muted-foreground">(não preenchido)</span>}
          </Label>
          <Switch 
            id="whatsapp-visible"
            checked={website.show_whatsapp !== false}
            onCheckedChange={(checked) => handleVisibilityChange('show_whatsapp', checked)}
            disabled={saving || !website.whatsapp}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="payment-visible" className="text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            {website.payment_method === 'pix' ? 'PIX' : website.payment_method === 'mbway' ? 'MB WAY' : 'Pagamento'}
            {!website.payment_key && <span className="text-xs text-muted-foreground">(não configurado)</span>}
          </Label>
          <Switch 
            id="payment-visible"
            checked={website.show_payment_method === true}
            onCheckedChange={(checked) => handleVisibilityChange('show_payment_method', checked)}
            disabled={saving || !website.payment_key}
          />
        </div>
      </div>

      {/* Preview Container - Phone Frame */}
      <div className="relative w-full max-w-[280px]">
        {/* Phone Frame */}
        <div className="relative rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-800 shadow-xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-20" />
          
          {/* Screen */}
          <div className="relative bg-black rounded-[1.5rem] overflow-hidden">
            <div 
              className="min-h-[500px]"
              style={{
                background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}cc, #1A1A1A)`
              }}
            >
              {/* Header */}
              <div className="flex flex-col items-center px-4 pt-10 pb-6">
                {/* Logo */}
                <Avatar 
                  className="w-20 h-20 border-4 shadow-2xl mb-2"
                  style={{ borderColor: `${theme.hex}80` }}
                >
                  <AvatarImage 
                    src={website.logo_url || undefined} 
                    alt={website.company_name} 
                    className="object-cover bg-white" 
                  />
                  <AvatarFallback 
                    className="text-xl text-white font-bold"
                    style={{ backgroundColor: theme.hex }}
                  >
                    {getInitials(website.company_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Verified Badge */}
                <Badge 
                  className="text-white text-[10px] px-2 py-0.5 rounded-full mb-2 flex items-center gap-1"
                  style={{ backgroundColor: theme.hex }}
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verificado
                </Badge>

                {/* Company Name */}
                <h1 className="text-lg font-bold text-white mb-0.5 text-center">
                  {website.company_name}
                </h1>

                {/* Category & Status */}
                <div className="flex items-center gap-1.5 text-white/80 text-[10px] mb-1 flex-wrap justify-center">
                  {website.industry && <span>{website.industry}</span>}
                  {website.price_range && (
                    <>
                      <span>·</span>
                      <span>{website.price_range}</span>
                    </>
                  )}
                  {isCurrentlyOpen !== null && (
                    <>
                      <span>·</span>
                      <span className={isCurrentlyOpen ? "text-emerald-400" : "text-rose-400"}>
                        {isCurrentlyOpen ? "Aberto" : "Fechado"}
                      </span>
                    </>
                  )}
                </div>

                {/* Slogan */}
                {website.slogan && (
                  <p className="text-white/70 text-[10px] text-center italic mb-2 px-2">
                    "{website.slogan}"
                  </p>
                )}

                {/* Location */}
                {website.location && (
                  <div className="flex items-center gap-1 text-white/60 text-[9px]">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{website.location}</span>
                  </div>
                )}
              </div>

              {/* Quick Contact Buttons */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {website.phone && website.show_phone !== false && (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#2A2A2A]/80">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${theme.hex}30` }}
                      >
                        <Phone className="w-4 h-4" style={{ color: theme.hex }} />
                      </div>
                      <span className="text-white text-[9px] font-medium">Ligar</span>
                    </div>
                  )}
                  
                  {website.whatsapp && website.show_whatsapp !== false && (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#2A2A2A]/80">
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <span className="text-white text-[9px] font-medium">WhatsApp</span>
                    </div>
                  )}
                  
                  {website.email && website.show_email !== false && (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#2A2A2A]/80">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${theme.hex}30` }}
                      >
                        <Mail className="w-4 h-4" style={{ color: theme.hex }} />
                      </div>
                      <span className="text-white text-[9px] font-medium">Email</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {website.description && (
                <div className="px-4 pb-3">
                  <div className="rounded-xl bg-[#2A2A2A]/80 p-3">
                    <p className="text-white/80 text-[10px] leading-relaxed line-clamp-3">
                      {website.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Services or Products */}
              {((website.business_type === 'services' && website.services?.length > 0) ||
                (website.business_type === 'products' && website.products?.length > 0)) && (
                <div className="px-4 pb-4">
                  <Collapsible open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#2A2A2A]/80 mb-2">
                      <div className="flex items-center gap-2">
                        {website.business_type === 'products' ? (
                          <Package className="w-3.5 h-3.5" style={{ color: theme.hex }} />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5" style={{ color: theme.hex }} />
                        )}
                        <span className="text-white/80 text-[10px] font-medium">
                          {website.business_type === 'products' ? 'Produtos' : 'Serviços'}
                          <span className="text-white/50 ml-1">
                            ({website.business_type === 'products' ? website.products?.length : website.services?.length})
                          </span>
                        </span>
                      </div>
                      {isCatalogOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-white/50" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1.5">
                      {website.business_type === 'products' ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          {website.products?.slice(0, 4).map((product: Product) => (
                            <div 
                              key={product.id} 
                              className="rounded-lg bg-[#2A2A2A]/60 overflow-hidden"
                            >
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-14 object-cover"
                                />
                              ) : (
                                <div className="w-full h-14 flex items-center justify-center bg-[#2A2A2A]">
                                  <Package className="w-5 h-5 text-white/20" />
                                </div>
                              )}
                              <div className="p-1.5">
                                <div className="flex items-center gap-0.5">
                                  <p className="text-white text-[9px] font-medium truncate flex-1">{product.name}</p>
                                  {product.url && <ExternalLink className="w-2 h-2 text-white/40" />}
                                </div>
                                <p className="text-[9px] font-semibold" style={{ color: theme.hex }}>
                                  {product.price}€
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {website.services?.slice(0, 4).map((service: Service, index: number) => (
                            <div 
                              key={service.id || index} 
                              className="flex items-center gap-2 p-2 rounded-lg bg-[#2A2A2A]/60"
                            >
                              {service.image_url ? (
                                <img 
                                  src={service.image_url}
                                  alt={service.name}
                                  className="w-7 h-7 rounded object-cover shrink-0"
                                />
                              ) : (
                                <div 
                                  className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${theme.hex}30` }}
                                >
                                  <Briefcase className="w-3 h-3" style={{ color: theme.hex }} />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-0.5">
                                  <p className="text-white text-[9px] font-medium truncate">{service.name}</p>
                                  {service.url && <ExternalLink className="w-2 h-2 text-white/40" />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {/* Payment Method Section */}
              {website.payment_key && website.show_payment_method && website.payment_method && (
                <div className="px-4 pb-4">
                  <div className="rounded-xl bg-[#2A2A2A]/80 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: website.payment_method === 'pix' 
                            ? 'rgba(50, 188, 173, 0.2)' 
                            : 'rgba(204, 0, 0, 0.2)' 
                        }}
                      >
                        {website.payment_method === 'pix' ? (
                          <svg viewBox="0 0 512 512" className="w-3.5 h-3.5" fill="#32BCAD">
                            <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.9 231.1 518.9 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C257.1 224.4 247.9 224.4 242.4 218.9L165.7 142.2C151.5 128 132.6 120.2 112.6 120.2H103.3L200.4 23.1C230.7-7.2 279.9-7.2 310.2 23.1L407.3 120.2H392.6C372.6 120.2 353.7 128 339.5 142.2L262.5 218.9z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-3.5 h-3.5">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#CC0000" strokeWidth="6" />
                            <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#CC0000">MB</text>
                          </svg>
                        )}
                      </div>
                      <span className="text-white text-[10px] font-semibold">
                        {website.payment_method === 'pix' ? 'Chave PIX' : 'MB WAY'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#1A1A1A]/60">
                      <span className="text-white/80 text-[9px] font-mono truncate">
                        {website.payment_key.length > 20 
                          ? `${website.payment_key.slice(0, 10)}...${website.payment_key.slice(-8)}`
                          : website.payment_key}
                      </span>
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${theme.hex}30` }}
                      >
                        <CreditCard className="w-2.5 h-2.5" style={{ color: theme.hex }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(website.instagram || website.facebook) && (
                <div className="px-4 pb-4">
                  <div className="flex justify-center gap-3">
                    {website.instagram && (
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${theme.hex}30` }}
                      >
                        <Instagram className="w-4 h-4" style={{ color: theme.hex }} />
                      </div>
                    )}
                    {website.facebook && (
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${theme.hex}30` }}
                      >
                        <Facebook className="w-4 h-4" style={{ color: theme.hex }} />
                      </div>
                    )}
                    {website.website_url && (
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${theme.hex}30` }}
                      >
                        <Globe className="w-4 h-4" style={{ color: theme.hex }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Public Page Button */}
      {website.subdomain && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open(`/c/${website.subdomain}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Ver Página Pública Business
        </Button>
      )}
    </div>
  );
};

export default BusinessPublicPagePreview;

