import { Building2, MapPin, Globe, Mail, Phone, Users, Briefcase, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";
import { useOrganizationTeamMembers } from '@/hooks/organization/useOrganizationTeamMembers';
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClassicLinkedInTemplateProps {
  website: OrganizationWebsite;
}

export const ClassicLinkedInTemplate = ({ website: data }: ClassicLinkedInTemplateProps) => {
  const { teamMembers } = useOrganizationTeamMembers(data.organization_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Banner */}
      <div 
        className="h-48 bg-gradient-to-r from-blue-600 to-blue-700 relative"
        style={{ 
          backgroundImage: data.banner_image_url ? `url(${data.banner_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 mt-0 pb-16">
        {/* Header Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="flex-shrink-0">
                {data.logo_url ? (
                  <img 
                    src={data.logo_url} 
                    alt={data.company_name}
                    className="w-32 h-32 object-contain bg-white rounded-lg border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg border-4 border-white shadow-md flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {data.company_name}
                </h1>
                
                {data.slogan && (
                  <p className="text-lg text-gray-600 mb-3 italic">
                    {data.slogan}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  {data.industry && (
                    <Badge variant="secondary" className="text-sm">
                      {data.industry}
                    </Badge>
                  )}
                  {data.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {data.location}
                    </div>
                  )}
                  {data.follower_count > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {data.follower_count.toLocaleString()} seguidores
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {data.website_url && (
                    <Button asChild variant="default">
                      <a href={data.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visitar Website
                      </a>
                    </Button>
                  )}
                  {data.show_contact_form && (
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        {data.description && (
          <Card className="mb-6 shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre Nós</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Team Section */}
        {data.show_team && teamMembers.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardContent className="pt-6">
              <TeamBlock
                title="Nossa Equipa"
                members={teamMembers}
                columns={4}
                showBio={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Services Section */}
        {data.show_services && data.services && data.services.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Serviços</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.services.map((service, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors bg-white">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Section */}
        {data.show_contact_form && (
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Entre em Contacto</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Informações</h3>
                  <div className="space-y-2">
                    {data.location && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-600" />
                        <span className="text-gray-700">{data.location}</span>
                      </div>
                    )}
                    {data.website_url && (
                      <div className="flex items-start gap-2 text-sm">
                        <Globe className="h-4 w-4 mt-0.5 text-gray-600" />
                        <a href={data.website_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {data.website_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Envie uma Mensagem</h3>
                  <p className="text-sm text-gray-600">
                    Formulário de contacto será implementado aqui
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {data.company_name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
