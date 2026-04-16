import { useState } from "react";
import { 
  MapPin, Clock, Phone, Mail, Globe, Linkedin, 
  ChevronDown, ChevronUp, Award, GraduationCap, Briefcase,
  ArrowLeft, Share2, Calendar, Scale, CheckCircle2, FileText,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock data for a professional (lawyer example)
const mockProfessional = {
  name: "Dr. António Silva",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  title: "Advogado Sénior",
  company: "Silva & Associados",
  verified: true,
  headline: "Especialista em Direito Empresarial e Contencioso Cível",
  bio: "Com mais de 20 anos de experiência no foro português, dedico-me à defesa dos interesses dos meus clientes com rigor, ética e compromisso. A minha abordagem combina conhecimento técnico profundo com uma visão estratégica orientada para resultados.",
  location: "Av. da Liberdade 220, 3º Esq., Lisboa",
  officeHours: "Segunda a Sexta, 09:00 - 18:00",
  qualifications: [
    { type: "education", title: "Licenciatura em Direito", institution: "Faculdade de Direito de Lisboa", year: "1998" },
    { type: "education", title: "Mestrado em Direito Empresarial", institution: "Universidade Católica Portuguesa", year: "2002" },
    { type: "certification", title: "Cédula Profissional n.º 12345L", institution: "Ordem dos Advogados", year: "1999" },
    { type: "certification", title: "Especialista em Arbitragem", institution: "Centro de Arbitragem Comercial", year: "2010" },
  ],
  specialties: [
    "Direito Empresarial",
    "Contencioso Cível",
    "Fusões e Aquisições",
    "Contratos Comerciais",
    "Direito Imobiliário",
    "Arbitragem",
  ],
  experience: [
    { role: "Sócio-Fundador", company: "Silva & Associados", period: "2010 - Presente" },
    { role: "Advogado Sénior", company: "Miranda & Associados", period: "2005 - 2010" },
    { role: "Advogado Associado", company: "PLMJ", period: "1999 - 2005" },
  ],
  contact: {
    phone: "+351 21 987 6543",
    email: "antonio.silva@silvaassociados.pt",
  },
  social: {
    website: "https://silvaassociados.pt",
    linkedin: "antoniosilvaadv",
  }
};

const BusinessMockupProfessional = () => {
  const [isQualificationsOpen, setIsQualificationsOpen] = useState(true);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link to="/dashboard" className="p-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-white/60 text-xs uppercase tracking-wider">Mockup · Profissional</span>
        <button className="p-2 text-white/80 hover:text-white">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex flex-col items-center text-center">
          {/* Photo with decorative ring */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full blur-lg opacity-30" />
            <Avatar className="w-36 h-36 border-4 border-amber-500/30 shadow-2xl relative">
              <AvatarImage src={mockProfessional.photo} alt={mockProfessional.name} className="object-cover" />
              <AvatarFallback className="bg-amber-600 text-white text-3xl">AS</AvatarFallback>
            </Avatar>
            {mockProfessional.verified && (
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center border-4 border-[#1a1a2e]">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Name & Title */}
          <h1 className="text-3xl font-bold text-white mb-2">{mockProfessional.name}</h1>
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <p className="text-amber-300 font-medium">{mockProfessional.title}</p>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Building2 className="w-4 h-4" />
            <span>{mockProfessional.company}</span>
          </div>

          {/* Headline */}
          <p className="text-white/60 text-sm italic mb-6 max-w-sm">
            "{mockProfessional.headline}"
          </p>

          {/* Specialties Pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {mockProfessional.specialties.slice(0, 4).map((specialty, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs"
              >
                {specialty}
              </Badge>
            ))}
            {mockProfessional.specialties.length > 4 && (
              <Badge 
                variant="outline" 
                className="bg-white/5 text-white/50 border-white/20 text-xs"
              >
                +{mockProfessional.specialties.length - 4}
              </Badge>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-2xl font-medium">
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Consulta
            </Button>
            <a href={`tel:${mockProfessional.contact.phone}`}>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-14 rounded-2xl">
                <Phone className="w-5 h-5 mr-2" />
                Ligar Agora
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="px-6 mb-6">
        <div className="p-5 rounded-2xl bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-semibold">Sobre Mim</h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            {mockProfessional.bio}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 space-y-4 pb-8">
        {/* Qualifications Section */}
        <Collapsible open={isQualificationsOpen} onOpenChange={setIsQualificationsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Formação e Certificações</p>
                  <p className="text-white/50 text-xs">{mockProfessional.qualifications.length} credenciais</p>
                </div>
              </div>
              {isQualificationsOpen ? (
                <ChevronUp className="w-5 h-5 text-white/50" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              {mockProfessional.qualifications.map((qual, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    qual.type === 'education' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                  }`}>
                    {qual.type === 'education' ? (
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Award className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{qual.title}</p>
                    <p className="text-white/50 text-xs mt-1">{qual.institution}</p>
                    <p className="text-white/30 text-xs mt-1">{qual.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Experience Section */}
        <Collapsible open={isExperienceOpen} onOpenChange={setIsExperienceOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Experiência Profissional</p>
                  <p className="text-white/50 text-xs">{mockProfessional.experience.length} posições</p>
                </div>
              </div>
              {isExperienceOpen ? (
                <ChevronUp className="w-5 h-5 text-white/50" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              {mockProfessional.experience.map((exp, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{exp.role}</p>
                    <p className="text-white/50 text-xs mt-1">{exp.company}</p>
                    <p className="text-white/30 text-xs mt-1">{exp.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* All Specialties */}
        <div className="p-4 rounded-2xl bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-medium text-sm">Áreas de Atuação</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockProfessional.specialties.map((specialty, idx) => (
              <Badge 
                key={idx} 
                className="bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Office Location & Hours */}
        <div className="p-4 rounded-2xl bg-white/5">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium text-sm">Escritório</p>
              <p className="text-white/50 text-xs mt-1">{mockProfessional.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Horário de Atendimento</p>
              <p className="text-white/50 text-xs mt-1">{mockProfessional.officeHours}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="p-4 rounded-2xl bg-white/5">
          <p className="text-white font-medium text-sm mb-4">Contactos</p>
          <div className="space-y-3">
            <a 
              href={`tel:${mockProfessional.contact.phone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5 text-green-400" />
              <span className="text-white/80 text-sm">{mockProfessional.contact.phone}</span>
            </a>
            <a 
              href={`mailto:${mockProfessional.contact.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-white/80 text-sm">{mockProfessional.contact.email}</span>
            </a>
          </div>
        </div>

        {/* Social/Professional Links */}
        <div className="p-4 rounded-2xl bg-white/5">
          <p className="text-white font-medium text-sm mb-4">Links Profissionais</p>
          <div className="space-y-3">
            <a 
              href={mockProfessional.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Globe className="w-5 h-5 text-white/60" />
              <span className="text-white/80 text-sm">Website do Escritório</span>
            </a>
            <a 
              href={`https://linkedin.com/in/${mockProfessional.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              <span className="text-white/80 text-sm">LinkedIn</span>
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

export default BusinessMockupProfessional;
