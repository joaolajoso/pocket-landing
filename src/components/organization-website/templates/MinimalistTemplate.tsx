import { OrganizationWebsite } from '@/hooks/organization/useOrganizationWebsite';
import { Building2, Globe, MapPin, Briefcase, User } from 'lucide-react';
import { useOrganizationTeamMembers } from '@/hooks/organization/useOrganizationTeamMembers';
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MinimalistTemplateProps {
  website: OrganizationWebsite;
}

export const MinimalistTemplate = ({ website }: MinimalistTemplateProps) => {
  const { teamMembers } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {website.banner_image_url && (
        <div className="w-full h-48 bg-muted">
          <img 
            src={website.banner_image_url} 
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-6">
          {website.logo_url && (
            <div className={website.banner_image_url ? "mb-8" : ""}>
              <div className="inline-block bg-background p-4 rounded-2xl shadow-lg border-4 border-background">
                <img 
                  src={website.logo_url} 
                  alt={website.company_name}
                  className="h-24 mx-auto object-contain"
                />
              </div>
            </div>
          )}
          
          <h1 className="text-6xl font-bold tracking-tight">
            {website.company_name}
          </h1>
          
          {website.slogan && (
            <p className="text-2xl text-muted-foreground font-light">
              {website.slogan}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-24 max-w-3xl">
        <div className="space-y-16">
          {/* Description */}
          {website.description && (
            <section className="prose prose-lg mx-auto max-w-none">
              <p className="text-xl leading-relaxed text-center">
                {website.description}
              </p>
            </section>
          )}

          {/* Info Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {website.industry && (
              <div className="text-center space-y-3 p-6 border rounded-lg">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Indústria</div>
                  <div className="font-medium">{website.industry}</div>
                </div>
              </div>
            )}
            
            {website.location && (
              <div className="text-center space-y-3 p-6 border rounded-lg">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Localização</div>
                  <div className="font-medium">{website.location}</div>
                </div>
              </div>
            )}
            
            {website.website_url && (
              <div className="text-center space-y-3 p-6 border rounded-lg">
                <Globe className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Website</div>
                  <a 
                    href={website.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    Visitar
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* Team */}
          {website.show_team && teamMembers.length > 0 && (
            <TeamBlock
              title="Nossa Equipa"
              members={teamMembers}
              columns={4}
              showBio={false}
            />
          )}

          {/* Services */}
          {website.show_services && website.services && website.services.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-center">Serviços</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {website.services.map((service, index) => (
                  <div key={index} className="text-center p-6 border rounded-lg hover:border-primary transition-colors">
                    <Briefcase className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-medium text-lg mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
