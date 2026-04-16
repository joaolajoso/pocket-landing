import { useState } from "react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { PublicPageTab } from "@/components/dashboard/tabs/business/PublicPageTab";
import { useOrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Users, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BusinessEmployeeCard } from "@/components/business-public/BusinessEmployeeCard";
import MemberProfileSheet from "@/components/dashboard/tabs/business/MemberProfileSheet";
import type { OrganizationMember } from "@/hooks/organization/useOrganization";

const BusinessPublicPageSettings = () => {
  const { organization, members } = useOrganization();
  const { website } = useOrganizationWebsite(organization?.id);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  if (!organization) return null;

  const activeMembers = members.filter(m => m.status === 'active');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-white">Página Pública</h1>
        <p className="text-white/50 text-sm mt-1">Configure a página pública da empresa e dos colaboradores</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="company" className="gap-1.5 text-xs data-[state=active]:bg-white/10">
            <Building2 className="h-3.5 w-3.5" />
            Página da Empresa
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-1.5 text-xs data-[state=active]:bg-white/10">
            <Users className="h-3.5 w-3.5" />
            Perfis dos Colaboradores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <PublicPageTab
            organizationId={organization.id}
            organizationName={organization.name}
          />
        </TabsContent>

        <TabsContent value="employees" className="mt-4 space-y-5">
          {/* Info Banner */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <p className="text-sm text-white/70">
              Cada colaborador tem uma <span className="text-white font-medium">página pública Business</span> que usa o banner, logo e contactos da empresa. 
              Os links e informações visíveis são configurados na <span className="text-white font-medium">Página da Empresa</span> (telefone, email, WhatsApp).
            </p>
            {website?.subdomain && (
              <p className="text-xs text-white/40 mt-2">
                URL: <span className="text-white/60 font-mono">{window.location.origin}/c/{website.subdomain}/[slug]</span>
              </p>
            )}
          </div>

          {/* Employee Cards Grid */}
          <div className="space-y-3">
            {activeMembers.map(member => (
              <button
                key={member.id}
                onClick={() => { setSelectedMember(member); setShowSheet(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={member.profile?.photo_url || ''} />
                  <AvatarFallback className="text-xs">
                    {member.profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{member.profile?.name || 'Unknown'}</p>
                  <p className="text-xs text-white/40 truncate">
                    {member.position || member.role}
                    {member.department ? ` · ${member.department}` : ''}
                  </p>
                  {website?.subdomain && member.profile?.slug && (
                    <p className="text-[10px] text-white/30 font-mono truncate">
                      /c/{website.subdomain}/{member.profile.slug}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/50 capitalize">
                    {member.role}
                  </Badge>
                  <Eye className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Preview of what the business card looks like */}
          {activeMembers.length > 0 && website && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-sm font-medium text-white/50 mb-4">Pré-visualização do Cartão Business</h3>
              <div className="flex justify-center">
                <div className="max-w-sm w-full">
                  <BusinessEmployeeCard
                    employeeName={activeMembers[0].profile?.name || 'Colaborador'}
                    employeePhoto={activeMembers[0].profile?.photo_url}
                    companyName={website.company_name}
                    companyLogo={website.logo_url || undefined}
                    bannerUrl={website.banner_image_url || undefined}
                    primaryColor={website.primary_color || undefined}
                    employeePhone={website.show_phone ? (website.phone || undefined) : undefined}
                    employeeEmail={website.show_email ? (website.email || undefined) : undefined}
                    ctaLabel="Ver como podemos ajudar"
                    ctaUrl={website.show_whatsapp && website.whatsapp ? `https://wa.me/${website.whatsapp.replace(/\D/g, '')}` : `/c/${website.subdomain}`}
                    slug={activeMembers[0].profile?.slug}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MemberProfileSheet
        member={selectedMember}
        open={showSheet}
        onOpenChange={setShowSheet}
      />
    </div>
  );
};

export default BusinessPublicPageSettings;
