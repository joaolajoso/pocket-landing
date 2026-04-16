import { useState } from "react";
import { 
  MapPin, Clock, Phone, Mail, Globe, Instagram, Facebook, 
  MessageCircle, ChevronDown, ChevronUp, Star, Wifi, Car,
  Coffee, Utensils, Waves, ArrowLeft, Share2, Calendar,
  Bed, Sparkles, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock data for a hotel/service business
const mockHotel = {
  name: "Hotel Vista Mar",
  logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop",
  banner: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=400&fit=crop",
  category: "Hotel 4 Estrelas · Praia",
  verified: true,
  slogan: "O seu refúgio à beira-mar",
  description: "Situado na deslumbrante costa algarvia, o Hotel Vista Mar oferece uma experiência única de conforto e tranquilidade. Com vista privilegiada para o oceano Atlântico, proporcionamos estadias memoráveis desde 1985.",
  location: "Avenida dos Descobrimentos 456, Albufeira, Algarve",
  region: "Região do Algarve, Portugal",
  rating: 4.6,
  reviewCount: 1250,
  hours: [
    { day: "Receção", hours: "24 horas" },
    { day: "Restaurante", hours: "07:00 - 23:00" },
    { day: "Bar", hours: "10:00 - 02:00" },
    { day: "Spa", hours: "09:00 - 21:00" },
    { day: "Piscina", hours: "08:00 - 20:00" },
  ],
  services: [
    { id: 1, name: "Quartos Vista Mar", description: "Suites e quartos com varanda e vista oceano", icon: Bed },
    { id: 2, name: "Restaurante Gourmet", description: "Cozinha mediterrânica com produtos locais", icon: Utensils },
    { id: 3, name: "Spa & Wellness", description: "Massagens, sauna e tratamentos relaxantes", icon: Sparkles },
    { id: 4, name: "Piscina Infinita", description: "Piscina exterior aquecida com vista mar", icon: Waves },
    { id: 5, name: "Wi-Fi Gratuito", description: "Internet de alta velocidade em todo o hotel", icon: Wifi },
    { id: 6, name: "Estacionamento", description: "Parque privado e gratuito para hóspedes", icon: Car },
  ],
  amenities: ["Wi-Fi", "Piscina", "Spa", "Restaurante", "Bar", "Ginásio", "Praia Privada"],
  contact: {
    phone: "+351 289 123 456",
    email: "reservas@hotelvistamar.pt",
    whatsapp: "+351912345678",
  },
  social: {
    website: "https://hotelvistamar.pt",
    instagram: "hotelvistamar",
    facebook: "hotelvistamar",
  }
};

const BusinessMockupServices = () => {
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c4a6e] via-[#082f49] to-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link to="/dashboard" className="p-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-white/60 text-xs uppercase tracking-wider">Mockup · Serviços</span>
        <button className="p-2 text-white/80 hover:text-white">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Banner */}
      <div className="relative h-52">
        <img 
          src={mockHotel.banner} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082f49] via-transparent to-transparent" />
      </div>

      {/* Logo & Basic Info */}
      <div className="px-6 -mt-20 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl mb-4">
            <AvatarImage src={mockHotel.logo} alt={mockHotel.name} className="object-cover" />
            <AvatarFallback className="bg-sky-600 text-white text-2xl">HV</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{mockHotel.name}</h1>
            {mockHotel.verified && (
              <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
            )}
          </div>
          <p className="text-sky-200/80 text-sm mb-2">{mockHotel.category}</p>
          <p className="text-white/50 text-sm italic">"{mockHotel.slogan}"</p>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${star <= Math.floor(mockHotel.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} 
                />
              ))}
            </div>
            <span className="text-white font-medium">{mockHotel.rating}</span>
          </div>
          <span className="text-white/30">|</span>
          <span className="text-white/60 text-sm">{mockHotel.reviewCount} avaliações</span>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed text-center mb-6">
          {mockHotel.description}
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button className="bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl">
            <Calendar className="w-5 h-5 mr-2" />
            Reservar Agora
          </Button>
          <a 
            href={`https://wa.me/${mockHotel.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-14 rounded-2xl">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactar
            </Button>
          </a>
        </div>

        {/* Amenities Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {mockHotel.amenities.map((amenity, idx) => (
            <Badge 
              key={idx} 
              variant="outline" 
              className="bg-white/5 text-white/70 border-white/20 text-xs"
            >
              {amenity}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 space-y-4 pb-8">
        {/* Services Section */}
        <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Os Nossos Serviços</p>
                  <p className="text-white/50 text-xs">{mockHotel.services.length} serviços disponíveis</p>
                </div>
              </div>
              {isServicesOpen ? (
                <ChevronUp className="w-5 h-5 text-white/50" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              {mockHotel.services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div 
                    key={service.id} 
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{service.name}</p>
                      <p className="text-white/50 text-xs mt-1">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Hours Section */}
        <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Horários</p>
                  <p className="text-white/50 text-xs">Receção 24h</p>
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
            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
              {mockHotel.hours.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-white/60">{item.day}</span>
                  <span className="text-white/80">{item.hours}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Location */}
        <div className="p-4 rounded-2xl bg-white/5">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Localização</p>
              <p className="text-white/50 text-xs mt-1">{mockHotel.location}</p>
              <p className="text-sky-300/60 text-xs mt-1">{mockHotel.region}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 rounded-xl"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Ver no Mapa
          </Button>
        </div>

        {/* Contact */}
        <div className="p-4 rounded-2xl bg-white/5">
          <p className="text-white font-medium text-sm mb-4">Contactos</p>
          <div className="space-y-3">
            <a 
              href={`tel:${mockHotel.contact.phone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5 text-green-400" />
              <span className="text-white/80 text-sm">{mockHotel.contact.phone}</span>
            </a>
            <a 
              href={`mailto:${mockHotel.contact.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-white/80 text-sm">{mockHotel.contact.email}</span>
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div className="p-4 rounded-2xl bg-white/5">
          <p className="text-white font-medium text-sm mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Redes Sociais
          </p>
          <div className="flex gap-3 justify-center">
            <a 
              href={mockHotel.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <Globe className="w-6 h-6 text-white/70" />
            </a>
            <a 
              href={`https://instagram.com/${mockHotel.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-80 transition-opacity flex items-center justify-center"
            >
              <Instagram className="w-6 h-6 text-white" />
            </a>
            <a 
              href={`https://facebook.com/${mockHotel.social.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-[#1877F2] hover:bg-[#1877F2]/80 transition-colors flex items-center justify-center"
            >
              <Facebook className="w-6 h-6 text-white" />
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

export default BusinessMockupServices;
