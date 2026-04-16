import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  MessageCircle,
  ArrowLeft,
  Share2,
  ChevronDown,
  ChevronUp,
  Package,
  Briefcase,
  Star,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { OrganizationWebsite, BusinessHour, Product, Service } from "@/types/organizationWebsite";
import { getBusinessTheme } from "@/components/business-public/businessColorThemes";
import { BusinessConnectCard } from "@/components/business-public/BusinessConnectCard";
import { BusinessSignupCTA } from "@/components/business-public/BusinessSignupCTA";
import PaymentMethodSection from "@/components/business-public/PaymentMethodSection";
import ProfileFileSection from "@/components/profile/ProfileFileSection";
interface BusinessPublicPageProps {
  website: OrganizationWebsite;
  ownerFile?: { url: string; name: string } | null;
}

const BusinessPublicPage = ({ website, ownerFile }: BusinessPublicPageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);

  // Get theme from accent_color or primary_color
  const theme = useMemo(() => {
    return getBusinessTheme(website.primary_color || '#0ea5e9');
  }, [website.primary_color]);

  // Check if currently open based on business hours
  const isCurrentlyOpen = useMemo(() => {
    if (!website.business_hours || website.business_hours.length === 0) return null;
    
    const now = new Date();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const todayName = days[now.getDay()];
    
    const todayHours = website.business_hours.find(
      (h: BusinessHour) => h.day.toLowerCase() === todayName.toLowerCase()
    );
    
    if (!todayHours || todayHours.isClosed) return false;
    
    // Simple check - could be enhanced with actual time parsing
    if (todayHours.hours.toLowerCase().includes('fechado')) return false;
    
    return true;
  }, [website.business_hours]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const sanitizePhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  const formatWhatsAppUrl = (phone: string) => {
    const sanitized = sanitizePhone(phone);
    return `https://wa.me/${sanitized.replace('+', '')}`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: website.company_name,
          text: website.slogan || website.description || '',
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência",
      });
    }
  };

  const hasSocialLinks = website.instagram || website.facebook || website.website_url;
  const hasContactButtons = 
    (website.phone && website.show_phone !== false) || 
    (website.whatsapp && website.show_whatsapp !== false) || 
    (website.email && website.show_email !== false);

  return (
    <div className="min-h-screen">
      {/* Gradient Background */}
      <div 
        className="min-h-screen"
        style={{
          background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}cc, #1A1A1A)`
        }}
      >
        {/* Header with floating buttons */}
        <div className="relative">
          {/* Banner Image */}
          {website.banner_image_url && (
            <div className="absolute inset-0 h-48">
              <img 
                src={website.banner_image_url} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, ${theme.hex}40, ${theme.hex})`
                }}
              />
            </div>
          )}

          {/* Floating navigation */}
          <div className="relative flex items-center justify-between px-6 pt-6 z-10">
            <Link to="/" className="p-2 text-white/90 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="p-2 text-white/90 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {user ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/30 transition-all"
                >
                  Home
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/30 transition-all"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>

          {/* Logo and Info */}
          <div className="relative flex flex-col items-center px-6 pt-8 pb-8 z-10">
            {/* Logo */}
            <div className="relative mb-3">
              <Avatar 
                className="w-32 h-32 border-4 shadow-2xl"
                style={{ borderColor: `${theme.hex}80` }}
              >
                <AvatarImage src={website.logo_url || undefined} alt={website.company_name} className="object-cover bg-white" />
                <AvatarFallback 
                  className="text-3xl text-white font-bold"
                  style={{ backgroundColor: theme.hex }}
                >
                  {getInitials(website.company_name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Verified Badge */}
            <Badge 
              className="text-white text-xs px-3 py-1 rounded-full mb-3 flex items-center gap-1"
              style={{ backgroundColor: theme.hex }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Verificado
            </Badge>

            {/* Company Name */}
            <h1 className="text-2xl font-bold text-white mb-1 text-center">
              {website.company_name}
            </h1>

            {/* Category, Price Range, Status */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2 flex-wrap justify-center">
              {website.industry && (
                <span>{website.industry}</span>
              )}
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
              <p className="text-white/70 text-sm text-center italic mb-4 px-4">
                "{website.slogan}"
              </p>
            )}

            {/* Location */}
            {(website.location || website.region) && (
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{website.location}{website.region ? `, ${website.region}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-8 space-y-4 max-w-md mx-auto">
          {/* Description */}
          {website.description && (
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <p className="text-white/80 text-sm leading-relaxed">
                {website.description}
              </p>
            </div>
          )}

          {/* Quick Contact Buttons */}
          {hasContactButtons && (
            <div className="grid grid-cols-3 gap-3">
              {website.phone && website.show_phone !== false && (
                <a 
                  href={`tel:${sanitizePhone(website.phone)}`}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${theme.hex}30` }}
                  >
                    <Phone className="w-6 h-6" style={{ color: theme.hex }} />
                  </div>
                  <span className="text-white text-xs font-medium">Ligar</span>
                </a>
              )}
              
              {website.whatsapp && website.show_whatsapp !== false && (
                <a 
                  href={formatWhatsAppUrl(website.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <span className="text-white text-xs font-medium">WhatsApp</span>
                </a>
              )}
              
              {website.email && website.show_email !== false && (
                <a 
                  href={`mailto:${website.email}`}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${theme.hex}30` }}
                  >
                    <Mail className="w-6 h-6" style={{ color: theme.hex }} />
                  </div>
                  <span className="text-white text-xs font-medium">Email</span>
                </a>
              )}

              {website.website_url && !website.phone && (
                <a 
                  href={website.website_url.startsWith('http') ? website.website_url : `https://${website.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${theme.hex}30` }}
                  >
                    <Globe className="w-6 h-6" style={{ color: theme.hex }} />
                  </div>
                  <span className="text-white text-xs font-medium">Website</span>
                </a>
              )}
            </div>
          )}

          {/* Location & Hours - Collapsible */}
          {(website.location || (website.business_hours && website.business_hours.length > 0)) && (
            <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: theme.hex }} />
                    <span className="text-white font-semibold text-sm">Localização e Horários</span>
                  </div>
                  {isHoursOpen ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-xl bg-[#2A2A2A]/60 p-4 space-y-3">
                {website.location && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(website.location + (website.region ? `, ${website.region}` : ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-white/60 mt-0.5" />
                      <span className="text-white/80 text-sm">{website.location}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  </a>
                )}
                {website.business_hours && website.business_hours.length > 0 && (
                  <div className="space-y-1">
                    {website.business_hours.map((hour: BusinessHour, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-white/60">{hour.day}</span>
                        <span className={hour.isClosed ? "text-rose-400" : "text-white/80"}>
                          {hour.isClosed ? "Fechado" : hour.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Products or Services */}
          {((website.business_type === 'products' && website.products?.length > 0) ||
            (website.business_type === 'services' && website.services?.length > 0)) && (
            <Collapsible open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors">
                  <div className="flex items-center gap-2">
                    {website.business_type === 'products' ? (
                      <Package className="w-5 h-5" style={{ color: theme.hex }} />
                    ) : (
                      <Briefcase className="w-5 h-5" style={{ color: theme.hex }} />
                    )}
                    <span className="text-white font-semibold text-sm">
                      {website.business_type === 'products' ? 'Produtos' : 'Serviços'}
                    </span>
                    <span className="text-white/50 text-xs">
                      ({website.business_type === 'products' ? website.products?.length : website.services?.length})
                    </span>
                  </div>
                  {isCatalogOpen ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {website.business_type === 'products' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {website.products?.slice(0, 6).map((product: Product) => {
                      const productCard = (
                        <div 
                          key={product.id} 
                          className={`rounded-xl bg-[#2A2A2A]/60 overflow-hidden ${product.url ? 'cursor-pointer hover:bg-[#2A2A2A] transition-colors' : ''}`}
                        >
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-24 object-cover"
                            />
                          )}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="text-white text-sm font-medium truncate flex-1">{product.name}</h3>
                              {product.url && (
                                <ExternalLink className="w-3 h-3 text-white/40 flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-sm font-bold" style={{ color: theme.hex }}>
                              {product.price}
                            </p>
                          </div>
                        </div>
                      );
                      
                      return product.url ? (
                        <a 
                          key={product.id}
                          href={product.url.startsWith('http') ? product.url : `https://${product.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {productCard}
                        </a>
                      ) : productCard;
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {website.services?.slice(0, 6).map((service: Service, index: number) => {
                      const serviceCard = (
                        <div 
                          key={service.id || index} 
                          className={`flex items-center gap-3 p-3 rounded-xl bg-[#2A2A2A]/60 ${service.url ? 'cursor-pointer hover:bg-[#2A2A2A] transition-colors' : ''}`}
                        >
                          {service.image_url ? (
                            <img 
                              src={service.image_url}
                              alt={service.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${theme.hex}30` }}
                            >
                              <Briefcase className="w-5 h-5" style={{ color: theme.hex }} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white text-sm font-medium">{service.name}</h3>
                            {service.description && (
                              <p className="text-white/60 text-xs truncate">{service.description}</p>
                            )}
                          </div>
                          {service.url && (
                            <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0" />
                          )}
                        </div>
                      );
                      
                      return service.url ? (
                        <a 
                          key={service.id || index}
                          href={service.url.startsWith('http') ? service.url : `https://${service.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {serviceCard}
                        </a>
                      ) : serviceCard;
                    })}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Payment Method Section */}
          {website.show_payment_method && website.payment_method && website.payment_key && (
            <PaymentMethodSection
              paymentMethod={website.payment_method}
              paymentKey={website.payment_key}
              themeHex={theme.hex}
            />
          )}

          {/* Social Networks */}
          {hasSocialLinks && (
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <h2 className="text-sm font-bold text-white mb-3">Redes Sociais</h2>
              <div className="grid grid-cols-3 gap-2">
                {website.instagram && (
                  <a 
                    href={website.instagram.startsWith('http') ? website.instagram : `https://instagram.com/${website.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#E4405F]/10 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-[#E4405F]" />
                    </div>
                  </a>
                )}
                {website.facebook && (
                  <a 
                    href={website.facebook.startsWith('http') ? website.facebook : `https://facebook.com/${website.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-[#1877F2]" />
                    </div>
                  </a>
                )}
                {website.website_url && (
                  <a 
                    href={website.website_url.startsWith('http') ? website.website_url : `https://${website.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Profile File Download */}
          {ownerFile && (
            <ProfileFileSection
              fileUrl={ownerFile.url}
              fileName={ownerFile.name}
              theme={{
                accentLight: `bg-[${theme.hex}]/20`,
                textAccent: `text-[${theme.hex}]`,
                accent: `bg-[${theme.hex}]`,
              }}
            />
          )}

          {/* Connect Card */}
          <BusinessConnectCard 
            businessId={website.id}
            businessName={website.company_name}
            organizationId={website.organization_id}
            theme={theme}
          />

          {/* Signup CTA */}
          {!user && (
            <BusinessSignupCTA 
              businessId={website.id}
              businessName={website.company_name}
            />
          )}

          {/* Footer */}
          <div className="text-center pt-6 pb-8">
            <a href="https://pocketcv.pt" target="_blank" rel="noopener noreferrer" className="inline-block">
              <img 
                src="/lovable-uploads/pocketcv-logo-white.png" 
                alt="PocketCV" 
                className="h-6 opacity-60 hover:opacity-100 transition-opacity mx-auto"
              />
            </a>
            <p className="text-white/40 text-xs mt-2">
              © 2024 PocketCV. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPublicPage;
