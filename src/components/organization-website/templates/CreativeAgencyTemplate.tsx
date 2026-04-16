import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles, Heart, Globe, Mail } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface CreativeAgencyTemplateProps {
  website: OrganizationWebsite;
}

export const CreativeAgencyTemplate = ({ website }: CreativeAgencyTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center z-10">
          {website.logo_url && (
            <div className="mb-8 inline-block">
              <img 
                src={website.logo_url} 
                alt={`${website.company_name} logo`}
                className="h-24 w-auto mx-auto"
              />
            </div>
          )}
          <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {website.company_name}
            </span>
          </h1>
          {website.slogan && (
            <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              {website.slogan}
            </p>
          )}
          {website.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              {website.description}
            </p>
          )}
          <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Ver Nosso Trabalho
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-5xl md:text-6xl font-black text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            O Que Fazemos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {website.services.map((service, index) => {
              const colors = [
                'from-pink-500 to-rose-500',
                'from-purple-500 to-indigo-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-yellow-500 to-orange-500',
                'from-red-500 to-pink-500',
              ];
              const bgColor = colors[index % colors.length];
              
              return (
                <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-rotate-1">
                  <div className={`h-3 bg-gradient-to-r ${bgColor}`} />
                  <CardContent className="pt-8 pb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center mb-6`}>
                      <Palette className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Section */}
      {website.show_team && members.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-24">
          <TeamBlock
            title="Mentes Criativas"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <Heart className="h-16 w-16 text-pink-600 mx-auto mb-8" />
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Vamos Criar Algo Incrível Juntos
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Transforme a sua visão em realidade com a nossa ajuda
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {website.website_url && (
              <Button size="lg" asChild className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                <a href={website.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-5 w-5" />
                  Visitar Website
                </a>
              </Button>
            )}
            <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg">
              <Mail className="mr-2 h-5 w-5" />
              Falar Connosco
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} {website.company_name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
