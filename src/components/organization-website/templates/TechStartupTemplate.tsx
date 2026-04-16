import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Rocket, Code, Users, ArrowRight, Globe } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface TechStartupTemplateProps {
  website: OrganizationWebsite;
}

export const TechStartupTemplate = ({ website }: TechStartupTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
        <div className="relative container mx-auto px-4 py-24 max-w-6xl">
          <div className="text-center space-y-8">
            {website.logo_url && (
              <div className="inline-block bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
                <img 
                  src={website.logo_url} 
                  alt={`${website.company_name} logo`}
                  className="h-20 w-20 object-contain"
                />
              </div>
            )}
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {website.company_name}
            </h1>
            {website.slogan && (
              <p className="text-2xl md:text-3xl text-purple-200 max-w-3xl mx-auto">
                {website.slogan}
              </p>
            )}
            {website.description && (
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {website.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              {website.website_url && (
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Rocket className="mr-2 h-5 w-5" />
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-950">
                Saber Mais
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              99%
            </div>
            <p className="text-slate-400">Uptime</p>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              10k+
            </div>
            <p className="text-slate-400">Utilizadores</p>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <p className="text-slate-400">Suporte</p>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              Fast
            </div>
            <p className="text-slate-400">Performance</p>
          </div>
        </div>
      </div>

      {/* Services/Features */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Funcionalidades
          </h2>
          <p className="text-center text-slate-400 mb-12 text-lg">Tecnologia que impulsiona o futuro</p>
          <div className="grid md:grid-cols-3 gap-8">
            {website.services.map((service, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{service.name}</h3>
                  <p className="text-slate-300">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team */}
      {website.show_team && members.length > 0 && (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <TeamBlock
            title="A Nossa Equipa"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 max-w-4xl text-center">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-slate-300 mb-8">Junte-se a milhares de utilizadores satisfeitos</p>
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Rocket className="mr-2 h-5 w-5" />
            Iniciar Gratuitamente
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">© {new Date().getFullYear()} {website.company_name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
