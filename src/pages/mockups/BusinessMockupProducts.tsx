import { useState } from "react";
import { 
  MapPin, Clock, Phone, Mail, Globe, Instagram, Facebook, 
  MessageCircle, ChevronDown, ChevronUp, Star, ShoppingBag,
  ArrowLeft, Share2, Tag
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock data for a physical store
const mockStore = {
  name: "Mercearia Tradicional",
  logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop",
  banner: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop",
  category: "Mercearia · Produtos Regionais",
  verified: true,
  description: "Desde 1952, a sua mercearia de confiança no coração de Lisboa. Produtos regionais portugueses, queijos artesanais, vinhos selecionados e muito mais.",
  location: "Rua Augusta 123, Baixa, Lisboa",
  priceRange: "€€",
  rating: 4.8,
  reviewCount: 234,
  hours: [
    { day: "Segunda-feira", hours: "09:00 - 19:00" },
    { day: "Terça-feira", hours: "09:00 - 19:00" },
    { day: "Quarta-feira", hours: "09:00 - 19:00" },
    { day: "Quinta-feira", hours: "09:00 - 19:00" },
    { day: "Sexta-feira", hours: "09:00 - 20:00" },
    { day: "Sábado", hours: "09:00 - 14:00" },
    { day: "Domingo", hours: "Encerrado" },
  ],
  products: [
    { id: 1, name: "Queijo Serra da Estrela", price: "18.50€", image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=300&fit=crop", category: "Queijos" },
    { id: 2, name: "Azeite Extra Virgem", price: "12.90€", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop", category: "Azeites" },
    { id: 3, name: "Vinho do Porto", price: "24.00€", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop", category: "Vinhos" },
    { id: 4, name: "Mel de Rosmaninho", price: "8.50€", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop", category: "Mel" },
    { id: 5, name: "Conservas Artesanais", price: "6.90€", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=300&h=300&fit=crop", category: "Conservas" },
    { id: 6, name: "Compotas Caseiras", price: "5.50€", image: "https://images.unsplash.com/photo-1563822249510-04678c78df85?w=300&h=300&fit=crop", category: "Doces" },
  ],
  contact: {
    phone: "+351 21 123 4567",
    email: "geral@merceariatradicional.pt",
    whatsapp: "+351912345678",
  },
  social: {
    website: "https://merceariatradicional.pt",
    instagram: "merceariatradicional",
    facebook: "merceariatradicional",
  }
};

const BusinessMockupProducts = () => {
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(true);

  // Get current day status
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;
  const currentHours = mockStore.hours[dayIndex];
  const isOpen = currentHours.hours !== "Encerrado";

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link to="/dashboard" className="p-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-white/60 text-xs uppercase tracking-wider">Mockup · Produtos</span>
        <button className="p-2 text-white/80 hover:text-white">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Banner */}
      <div className="relative h-44">
        <img 
          src={mockStore.banner} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
      </div>

      {/* Logo & Basic Info */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <Avatar className="w-28 h-28 border-4 border-[#111111] shadow-xl">
            <AvatarImage src={mockStore.logo} alt={mockStore.name} className="object-cover" />
            <AvatarFallback className="bg-orange-600 text-white text-2xl">MT</AvatarFallback>
          </Avatar>
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{mockStore.name}</h1>
              {mockStore.verified && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-white/60 text-sm">{mockStore.category}</p>
          </div>
        </div>

        {/* Status & Rating */}
        <div className="flex items-center gap-4 mb-4">
          <Badge 
            variant="outline" 
            className={`${isOpen ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
          >
            {isOpen ? 'Aberto agora' : 'Fechado'}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-medium">{mockStore.rating}</span>
            <span className="text-white/50 text-sm">({mockStore.reviewCount})</span>
          </div>
          <Badge variant="outline" className="bg-white/5 text-white/70 border-white/20">
            <Tag className="w-3 h-3 mr-1" />
            {mockStore.priceRange}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          {mockStore.description}
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a 
            href={`tel:${mockStore.contact.phone}`}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-white/80 text-xs">Ligar</span>
          </a>
          <a 
            href={`https://wa.me/${mockStore.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <span className="text-white/80 text-xs">WhatsApp</span>
          </a>
          <a 
            href={`mailto:${mockStore.contact.email}`}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white/80 text-xs">Email</span>
          </a>
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 space-y-4 pb-8">
        {/* Hours Section */}
        <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Horário de Funcionamento</p>
                  <p className="text-white/50 text-xs">{currentHours.hours}</p>
                </div>
              </div>
              {isHoursOpen ? (
                <ChevronUp className="w-5 h-5 text-white/50" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-white/5 rounded-2xl p-4 space-y-2">
              {mockStore.hours.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className={`${idx === dayIndex ? 'text-orange-400 font-medium' : 'text-white/60'}`}>
                    {item.day}
                  </span>
                  <span className={`${idx === dayIndex ? 'text-orange-400 font-medium' : 'text-white/80'}`}>
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Location */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5">
          <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Localização</p>
            <p className="text-white/50 text-xs">{mockStore.location}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10">
            Ver Mapa
          </Button>
        </div>

        {/* Products Catalog */}
        <Collapsible open={isProductsOpen} onOpenChange={setIsProductsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Catálogo de Produtos</p>
                  <p className="text-white/50 text-xs">{mockStore.products.length} produtos</p>
                </div>
              </div>
              {isProductsOpen ? (
                <ChevronUp className="w-5 h-5 text-white/50" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              {mockStore.products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/8 transition-colors cursor-pointer"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-white/50 text-xs mb-1">{product.category}</p>
                    <p className="text-white font-medium text-sm mb-1 line-clamp-1">{product.name}</p>
                    <p className="text-orange-400 font-bold">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Social Links */}
        <div className="p-4 rounded-2xl bg-white/5">
          <p className="text-white font-medium text-sm mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Links
          </p>
          <div className="space-y-3">
            <a 
              href={mockStore.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Globe className="w-5 h-5 text-white/60" />
              <span className="text-white/80 text-sm">Website</span>
            </a>
            <a 
              href={`https://instagram.com/${mockStore.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Instagram className="w-5 h-5 text-[#E4405F]" />
              <span className="text-white/80 text-sm">Instagram</span>
            </a>
            <a 
              href={`https://facebook.com/${mockStore.social.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Facebook className="w-5 h-5 text-[#1877F2]" />
              <span className="text-white/80 text-sm">Facebook</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t border-white/10">
        <p className="text-center text-white/30 text-xs">
          Perfil criado com PocketCV
        </p>
      </div>
    </div>
  );
};

export default BusinessMockupProducts;
