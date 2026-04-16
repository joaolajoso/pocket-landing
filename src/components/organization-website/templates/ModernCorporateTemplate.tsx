import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, Award, Mail, Phone, Globe } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface ModernCorporateTemplateProps {
  website: OrganizationWebsite;
}

export const ModernCorporateTemplate = ({ website }: ModernCorporateTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        {website.banner_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${website.banner_image_url})` }}
          />
        )}
        <div className="relative container mx-auto px-4 py-20 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {website.logo_url && (
              <div className="bg-white p-6 rounded-2xl shadow-2xl">
                <img 
                  src={website.logo_url} 
                  alt={`${website.company_name} logo`}
                  className="h-24 w-24 object-contain"
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-4">{website.company_name}</h1>
              {website.slogan && (
                <p className="text-2xl text-blue-100 mb-6">{website.slogan}</p>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {website.industry && (
                  <Badge variant="secondary" className="px-4 py-2 text-base">
                    <Building2 className="h-4 w-4 mr-2" />
                    {website.industry}
                  </Badge>
                )}
                {website.location && (
                  <Badge variant="secondary" className="px-4 py-2 text-base">
                    {website.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6 -mt-12">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-t-blue-600">
            <CardContent className="pt-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excelência</h3>
              <p className="text-muted-foreground">Compromisso com resultados de qualidade superior</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-t-blue-600">
            <CardContent className="pt-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Colaboração</h3>
              <p className="text-muted-foreground">Trabalhamos em equipa para alcançar objetivos</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-t-blue-600">
            <CardContent className="pt-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Inovação</h3>
              <p className="text-muted-foreground">Soluções criativas para desafios complexos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* About Section */}
      {website.description && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl font-bold mb-8 text-center">Sobre Nós</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {website.description}
            </p>
          </div>
        </div>
      )}

      {/* Services */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Nossos Serviços</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {website.services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-3">{service.name}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team */}
      {website.show_team && members.length > 0 && (
        <div className="bg-slate-50 py-16">
          <TeamBlock
            title="Nossa Equipa"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Vamos Trabalhar Juntos</h2>
          <p className="text-xl mb-8 text-blue-100">Entre em contacto connosco para saber mais</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {website.website_url && (
              <Button size="lg" variant="secondary" asChild>
                <a href={website.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-5 w-5" />
                  Visitar Website
                </a>
              </Button>
            )}
            <Button size="lg" variant="outline" className="bg-white text-blue-900 hover:bg-blue-50">
              <Mail className="mr-2 h-5 w-5" />
              Contactar
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">© {new Date().getFullYear()} {website.company_name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
