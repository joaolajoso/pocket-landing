import { useState, useEffect } from "react";
import { 
  MapPin, Clock, Phone, Mail, Globe, Instagram, Facebook, 
  MessageCircle, ChevronDown, ChevronUp, Star, ShoppingBag,
  Share2, Tag, Briefcase, Package, CheckCircle2,
  ExternalLink, FileText, Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { OrganizationWebsite } from "@/types/organizationWebsite";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BusinessPagePreviewProps {
  data: Partial<OrganizationWebsite>;
  className?: string;
}

export const BusinessPagePreview = ({ data, className }: BusinessPagePreviewProps) => {
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [profileFile, setProfileFile] = useState<{ url: string; name: string } | null>(null);
  const { user } = useAuth();

  // Fetch owner's profile file
  useEffect(() => {
    if (!user) return;
    const fetchFile = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("profile_file_url, profile_file_name")
        .eq("id", user.id)
        .single();
      if (profileData?.profile_file_url && profileData?.profile_file_name) {
        setProfileFile({ url: profileData.profile_file_url, name: profileData.profile_file_name });
      }
    };
    fetchFile();
  }, [user]);

  const isProductsType = data.business_type === 'products';

  // Get initials from company name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Check if business is open based on hours
  const getIsOpen = () => {
    if (!data.business_hours || data.business_hours.length === 0) return null;
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    const currentHours = data.business_hours[dayIndex];
    if (!currentHours) return null;
    return !currentHours.isClosed && currentHours.hours !== "Encerrado";
  };

  const isOpen = getIsOpen();

  return (
    <div className={`relative ${className || ''}`}>
      {/* Phone Frame */}
      <div className="relative mx-auto w-full max-w-[320px]">
        {/* Phone Border */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] -m-2 shadow-2xl" />
        
        {/* Screen Content */}
        <div className="relative bg-[#111111] rounded-[2.5rem] overflow-hidden border-8 border-gray-900">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
          
          {/* Content */}
          <div className="h-[580px] overflow-y-auto scrollbar-hide">
            {/* Banner */}
            <div className="relative h-36">
              {data.banner_image_url ? (
                <img 
                  src={data.banner_image_url} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full ${isProductsType ? 'bg-gradient-to-br from-orange-500 to-orange-700' : 'bg-gradient-to-br from-sky-500 to-sky-700'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
            </div>

            {/* Logo & Info */}
            <div className="px-4 -mt-12 relative z-10">
              <div className="flex items-end gap-3 mb-3">
                <Avatar className="w-20 h-20 border-4 border-[#111111] shadow-xl">
                  {data.logo_url ? (
                    <AvatarImage src={data.logo_url} alt={data.company_name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className={`${isProductsType ? 'bg-orange-600' : 'bg-sky-600'} text-white text-lg`}>
                    {getInitials(data.company_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h1 className="text-lg font-bold text-white truncate">
                      {data.company_name || "Nome da Empresa"}
                    </h1>
                    <CheckCircle2 className="w-4 h-4 text-green-400 fill-green-400/20 flex-shrink-0" />
                  </div>
                  <p className="text-white/60 text-xs truncate">
                    {data.industry || "Categoria"} {data.price_range && `· ${data.price_range}`}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isOpen !== null && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${isOpen 
                      ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                      : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                  >
                    {isOpen ? 'Aberto agora' : 'Fechado'}
                  </Badge>
                </div>
              )}

              {/* Slogan */}
              {data.slogan && (
                <p className="text-white/50 text-xs italic mb-2">"{data.slogan}"</p>
              )}

              {/* Description */}
              {data.description && (
                <p className="text-white/70 text-xs leading-relaxed mb-4 line-clamp-3">
                  {data.description}
                </p>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-white/70 text-[10px]">Ligar</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <span className="text-white/70 text-[10px]">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white/70 text-[10px]">Website</span>
                </button>
              </div>

              {/* Location */}
              {(data.location || data.region) && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 mb-4">
                  <MapPin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                  <div>
                    {data.location && <p className="text-white/80 text-xs">{data.location}</p>}
                    {data.region && <p className="text-white/50 text-xs">{data.region}</p>}
                  </div>
                </div>
              )}

              {/* Hours */}
              {data.business_hours && data.business_hours.length > 0 && (
                <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen} className="mb-4">
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/50" />
                      <span className="text-white/80 text-xs">Horários de Funcionamento</span>
                    </div>
                    {isHoursOpen ? (
                      <ChevronUp className="w-4 h-4 text-white/50" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/50" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1.5 px-3">
                    {data.business_hours.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-white/60">{item.day}</span>
                        <span className={item.isClosed ? "text-red-400" : "text-white/80"}>
                          {item.isClosed ? "Fechado" : item.hours}
                        </span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Products or Services */}
              {isProductsType ? (
                // Products Grid
                data.products && data.products.length > 0 && (
                  <Collapsible open={isCatalogOpen} onOpenChange={setIsCatalogOpen} className="mb-4">
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 mb-2">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-orange-400" />
                        <span className="text-white/80 text-xs font-medium">
                          Produtos ({data.products.length})
                        </span>
                      </div>
                      {isCatalogOpen ? (
                        <ChevronUp className="w-4 h-4 text-white/50" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-2 gap-2">
                        {data.products.slice(0, 6).map((product) => (
                          <div key={product.id} className="bg-white/5 rounded-xl overflow-hidden">
                            <div className="aspect-square bg-white/10">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <div className="flex items-center gap-1">
                                <p className="text-white text-xs font-medium truncate flex-1">{product.name}</p>
                                {product.url && (
                                  <ExternalLink className="w-2.5 h-2.5 text-white/40 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-orange-400 text-xs font-semibold">{product.price}€</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              ) : (
                // Services List
                data.services && data.services.length > 0 && (
                  <Collapsible open={isCatalogOpen} onOpenChange={setIsCatalogOpen} className="mb-4">
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 mb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-sky-400" />
                        <span className="text-white/80 text-xs font-medium">
                          Serviços ({data.services.length})
                        </span>
                      </div>
                      {isCatalogOpen ? (
                        <ChevronUp className="w-4 h-4 text-white/50" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      {data.services.slice(0, 6).map((service) => (
                        <div key={service.id || service.name} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                          {service.image_url ? (
                            <img 
                              src={service.image_url}
                              alt={service.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-4 h-4 text-sky-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-white text-xs font-medium">{service.name}</p>
                              {service.url && (
                                <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                              )}
                            </div>
                            {service.description && (
                              <p className="text-white/50 text-[10px] line-clamp-2">{service.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )
              )}

              {/* Profile File */}
              {profileFile && (
                <a
                  href={profileFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 mb-4"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                    {profileFile.name.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={`${profileFile.url}#page=1&view=FitH`}
                        className="w-full h-full pointer-events-none"
                        title="Preview"
                        tabIndex={-1}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{profileFile.name}</p>
                    <p className="text-white/50 text-[10px]">Descarregar</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-white/40" />
                </a>
              )}

              {/* Social Links */}
              <div className="flex justify-center gap-4 pb-8">
                {data.instagram && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                )}
                {data.facebook && (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                )}
                {data.website_url && (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
