import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Linkedin, Github, Globe } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface PortfolioStyleTemplateProps {
  website: OrganizationWebsite;
}

export const PortfolioStyleTemplate = ({ website }: PortfolioStyleTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {website.banner_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${website.banner_image_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        
        <div className="relative z-10 text-center px-4">
          {website.logo_url && (
            <div className="mb-8 inline-block">
              <img 
                src={website.logo_url} 
                alt={`${website.company_name} logo`}
                className="h-16 w-auto mx-auto filter brightness-0 invert"
              />
            </div>
          )}
          <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tight">
            {website.company_name}
          </h1>
          {website.slogan && (
            <p className="text-2xl md:text-3xl text-gray-400 mb-8 font-light">
              {website.slogan}
            </p>
          )}
          <div className="flex gap-6 justify-center text-gray-400">
            {website.website_url && (
              <a href={website.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Globe className="h-6 w-6" />
              </a>
            )}
            <a href="#" className="hover:text-white transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Github className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Mail className="h-6 w-6" />
            </a>
          </div>
          <div className="mt-12">
            <a href="#work" className="text-sm text-gray-400 hover:text-white transition-colors">
              Scroll para ver trabalhos ↓
            </a>
          </div>
        </div>
      </div>

      {/* About */}
      {website.description && (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="border-l-2 border-white pl-8">
            <h2 className="text-5xl font-bold mb-8">Sobre</h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              {website.description}
            </p>
          </div>
        </div>
      )}

      {/* Work/Services - Masonry Grid */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div id="work" className="container mx-auto px-4 py-24">
          <h2 className="text-5xl font-bold mb-16 text-center">Trabalhos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {website.services.map((service, index) => {
              // Alternate heights for masonry effect
              const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-64', 'h-88'];
              const height = heights[index % heights.length];
              
              return (
                <Card 
                  key={index} 
                  className={`${height} bg-zinc-900 border-zinc-800 hover:border-white transition-all duration-300 group overflow-hidden cursor-pointer`}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:opacity-90 transition-opacity" />
                    <CardContent className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                      <h3 className="text-2xl font-bold mb-2 text-white group-hover:translate-y-0 translate-y-2 transition-transform">
                        {service.name}
                      </h3>
                      <p className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {service.description}
                      </p>
                      <Button 
                        variant="ghost" 
                        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity w-fit text-white hover:text-white hover:bg-white/10"
                      >
                        Ver Projeto
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Team */}
      {website.show_team && members.length > 0 && (
        <div className="bg-zinc-950 py-24">
          <TeamBlock
            title="Equipa"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* Contact CTA */}
      <div className="container mx-auto px-4 py-32 text-center max-w-3xl">
        <h2 className="text-6xl md:text-7xl font-bold mb-8">
          Vamos Trabalhar<br />Juntos
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Tem um projeto em mente? Vamos conversar.
        </p>
        <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg">
          <Mail className="mr-2 h-5 w-5" />
          Entrar em Contacto
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {website.company_name}
            </p>
            <div className="flex gap-6 text-gray-500">
              {website.website_url && (
                <a href={website.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">
                  Website
                </a>
              )}
              <a href="#" className="hover:text-white transition-colors text-sm">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors text-sm">Instagram</a>
              <a href="#" className="hover:text-white transition-colors text-sm">Behance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
