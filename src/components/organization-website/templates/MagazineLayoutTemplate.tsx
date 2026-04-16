import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, User, Globe } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface MagazineLayoutTemplateProps {
  website: OrganizationWebsite;
}

export const MagazineLayoutTemplate = ({ website }: MagazineLayoutTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-900 py-8">
        <div className="container mx-auto px-4 text-center">
          {website.logo_url && (
            <img src={website.logo_url} alt={website.company_name} className="h-16 mx-auto mb-4" />
          )}
          <h1 className="font-serif text-5xl font-bold text-amber-900 mb-2">{website.company_name}</h1>
          {website.slogan && <p className="text-lg text-gray-600 italic">{website.slogan}</p>}
        </div>
      </header>

      {/* Featured Article */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Card className="overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 aspect-video md:aspect-auto" />
            <CardContent className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-amber-900">DESTAQUE</Badge>
              <h2 className="font-serif text-4xl font-bold mb-4 text-gray-900">
                {website.description || "História em Destaque"}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Descubra as últimas novidades e insights da nossa organização.
              </p>
              <Button className="w-fit bg-amber-900 hover:bg-amber-800">
                <BookOpen className="mr-2 h-4 w-4" />
                Ler Mais
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Articles Grid */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <h2 className="font-serif text-4xl font-bold mb-8 text-amber-900">Últimos Artigos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {website.services.map((service, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 h-48" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 text-gray-900">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                  <Button variant="link" className="p-0 text-amber-900 hover:text-amber-700">
                    Continuar a ler →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team/Contributors */}
      {website.show_team && members.length > 0 && (
        <div className="bg-white py-16">
          <TeamBlock
            title="Colaboradores"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-200">© {new Date().getFullYear()} {website.company_name}</p>
        </div>
      </footer>
    </div>
  );
};
