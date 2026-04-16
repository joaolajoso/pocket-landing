import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Tag, TrendingUp, Star, CreditCard, Truck, Globe } from "lucide-react";
import { useOrganizationTeamMembers } from "@/hooks/organization/useOrganizationTeamMembers";
import { TeamBlock } from "@/components/organization-website/blocks/TeamBlock";
import type { OrganizationWebsite } from "@/types/organizationWebsite";

interface EcommerceFocusTemplateProps {
  website: OrganizationWebsite;
}

export const EcommerceFocusTemplate = ({ website }: EcommerceFocusTemplateProps) => {
  const { teamMembers: members } = useOrganizationTeamMembers(website.organization_id);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {website.logo_url && (
              <img 
                src={website.logo_url} 
                alt={`${website.company_name} logo`}
                className="h-10 w-auto"
              />
            )}
            <span className="text-xl font-bold text-gray-900">{website.company_name}</span>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Comprar Agora
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-20">
        {website.banner_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${website.banner_image_url})` }}
          />
        )}
        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 mb-6 text-base px-4 py-2">
            <Tag className="h-4 w-4 mr-2" />
            PROMOÇÃO ESPECIAL
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            {website.slogan || "Compre Mais, Poupe Mais"}
          </h1>
          {website.description && (
            <p className="text-xl mb-8 text-white/90">
              {website.description}
            </p>
          )}
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-bold">
            Ver Ofertas
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-50 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">Envio Grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">Garantia 30 Dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products/Services */}
      {website.show_services && website.services && website.services.length > 0 && (
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 mb-4">
              BESTSELLERS
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Produtos em Destaque</h2>
            <p className="text-xl text-gray-600">As nossas melhores escolhas para si</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {website.services.map((service, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-500">
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-orange-600 opacity-50" />
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(127)</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-orange-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-orange-600">€99</span>
                      <span className="text-sm text-gray-400 line-through ml-2">€149</span>
                    </div>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      {website.description && (
        <div className="bg-gradient-to-br from-gray-50 to-orange-50 py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Sobre {website.company_name}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {website.description}
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div>
                <div className="text-5xl font-bold text-orange-600 mb-2">10k+</div>
                <p className="text-gray-600">Clientes Felizes</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-600 mb-2">500+</div>
                <p className="text-gray-600">Produtos</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-600 mb-2">4.9★</div>
                <p className="text-gray-600">Avaliação Média</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team */}
      {website.show_team && members.length > 0 && (
        <div className="container mx-auto px-4 py-20">
          <TeamBlock
            title="A Nossa Equipa"
            members={members}
            columns={4}
            showBio={false}
          />
        </div>
      )}

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Receba Ofertas Exclusivas</h2>
          <p className="text-lg mb-8 text-orange-100">
            Subscreva a nossa newsletter e ganhe 10% de desconto na primeira compra
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="O seu email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button className="bg-white text-orange-600 hover:bg-gray-100 px-6">
              Subscrever
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 mb-4">© {new Date().getFullYear()} {website.company_name}. Todos os direitos reservados.</p>
            {website.website_url && (
              <Button variant="link" className="text-gray-300 hover:text-white" asChild>
                <a href={website.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visitar Loja Online
                </a>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
