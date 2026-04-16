import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Shield, Star, CheckCircle2, Globe, Phone } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface ProfessionalServicesTemplateProps {
  website: OrganizationWebsite;
}

export const ProfessionalServicesTemplate = ({ website }: ProfessionalServicesTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {website.logo_url && (
              <img 
                src={website.logo_url} 
                alt={`${website.company_name} logo`}
                className="h-12 w-auto"
              />
            )}
            <span className="text-xl font-bold">{website.company_name}</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#services" className="hover:text-yellow-400 transition-colors">Serviços</a>
            <a href="#team" className="hover:text-yellow-400 transition-colors">Equipa</a>
            <a href="#contact" className="hover:text-yellow-400 transition-colors">Contacto</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-slate-100 py-20">
        {website.banner_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${website.banner_image_url})` }}
          />
        )}
        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          <div className="flex justify-center gap-3 mb-6">
            <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-600">
              <Award className="h-3 w-3 mr-1" />
              Certificado
            </Badge>
            <Badge className="bg-blue-500 text-white hover:bg-blue-600">
              <Shield className="h-3 w-3 mr-1" />
              Confiável
            </Badge>
            <Badge className="bg-green-500 text-white hover:bg-green-600">
              <Star className="h-3 w-3 mr-1" />
              Premiado
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {website.slogan || website.company_name}
          </h1>
          {website.description && (
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              {website.description}
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-900 hover:bg-blue-800">
              Solicitar Consulta Gratuita
            </Button>
            {website.website_url && (
              <Button size="lg" variant="outline" asChild>
                <a href={website.website_url} target="_blank" rel="noopener noreferrer">
                  Saber Mais
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white py-12 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-900 mb-2">25+</div>
              <p className="text-gray-600">Anos de Experiência</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900 mb-2">500+</div>
              <p className="text-gray-600">Clientes Satisfeitos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900 mb-2">98%</div>
              <p className="text-gray-600">Taxa de Sucesso</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900 mb-2">24/7</div>
              <p className="text-gray-600">Apoio Dedicado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div id="services" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Os Nossos Serviços</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Soluções profissionais adaptadas às suas necessidades
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {website.services.map((service, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{service.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team */}
      {website.show_team && members.length > 0 && (
        <div id="team" className="bg-white py-20">
          <TeamBlock
            title="A Nossa Equipa de Especialistas"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* CTA */}
      <div id="contact" className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl mb-10 text-blue-100">
            Entre em contacto connosco hoje para uma consulta gratuita e sem compromisso
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
              <Phone className="mr-2 h-5 w-5" />
              Ligar Agora
            </Button>
            {website.website_url && (
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900" asChild>
                <a href={website.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-5 w-5" />
                  Visitar Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} {website.company_name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
