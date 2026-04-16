import { OrganizationWebsite } from '@/hooks/organization/useOrganizationWebsite';
import { Building2, Globe, MapPin, Users, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganizationTeamMembers } from '@/hooks/organization/useOrganizationTeamMembers';
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SocialMediaFocusTemplateProps {
  website: OrganizationWebsite;
}

export const SocialMediaFocusTemplate = ({ website }: SocialMediaFocusTemplateProps) => {
  const { teamMembers } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Hero Section with Gradient/Banner */}
      <div className="relative overflow-hidden">
        {website.banner_image_url ? (
          <>
            <div className="w-full h-64 md:h-80">
              <img 
                src={website.banner_image_url} 
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/60 via-blue-600/60 to-pink-600/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-90" />
        )}
        
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          {website.logo_url && (
            <div className="mb-6">
              <div className="inline-block bg-white p-4 rounded-2xl shadow-2xl">
                <img 
                  src={website.logo_url} 
                  alt={website.company_name}
                  className="h-24 object-contain"
                />
              </div>
            </div>
          )}
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {website.company_name}
          </h1>
          
          {website.slogan && (
            <p className="text-xl md:text-2xl mb-8 font-light drop-shadow">
              {website.slogan}
            </p>
          )}
          
          {/* Follower Count */}
          {website.follower_count && website.follower_count > 0 && (
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <Users className="h-5 w-5 mr-2" />
              <span className="font-semibold text-lg">
                {website.follower_count.toLocaleString()} seguidores
              </span>
            </div>
          )}
          
          {/* CTA Button */}
          {website.website_url && (
            <div>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8"
                onClick={() => window.open(website.website_url, '_blank')}
              >
                Visitar Website
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Description Card */}
        {website.description && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Sobre Nós</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {website.description}
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {website.industry && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Indústria</div>
                  <div className="font-semibold text-lg">{website.industry}</div>
                </div>
              </div>
            </div>
          )}
          
          {website.location && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-pink-500 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Localização</div>
                  <div className="font-semibold text-lg">{website.location}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Section */}
        {website.show_team && teamMembers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <TeamBlock
              title="Nossa Equipa"
              members={teamMembers}
              columns={4}
              showBio={false}
            />
          </div>
        )}

        {/* Services Section */}
        {website.show_services && website.services && website.services.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {website.services.map((service, index) => (
                <div key={index} className="p-6 border-2 border-purple-100 rounded-xl hover:border-purple-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-lg">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
