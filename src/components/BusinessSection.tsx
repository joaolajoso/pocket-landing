
import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Building, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedText } from "@/utils/languageHelpers";

const BusinessSection = () => {
  const { language } = useLanguage();
  
  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-pocketcv-purple" />,
      title: getLocalizedText(language, 'Networking em Equipa', 'Team Networking'),
      description: getLocalizedText(
        language,
        'Equipe toda a sua equipa com cartões PocketCV para networking eficiente e moderno.',
        'Equip your entire team with professional networking tools for efficient and modern connection building.'
      )
    },
    {
      icon: <Building className="h-8 w-8 text-pocketcv-purple" />,
      title: getLocalizedText(language, 'Economia em Volume', 'Bulk Savings'),
      description: getLocalizedText(
        language,
        'Preços com desconto ao comprar cartões em volume.',
        'Discounted pricing when buying cards in bulk.'
      )
    },
    {
      icon: <Briefcase className="h-8 w-8 text-pocketcv-purple" />,
      title: getLocalizedText(language, 'Atualizações Instantâneas', 'Instant Updates'),
      description: getLocalizedText(
        language,
        'Atualize todos os perfis da equipa instantaneamente sem reimprimir cartões desatualizados.',
        'Update all team profiles instantly without reprinting outdated business cards.'
      )
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gradient">
              {getLocalizedText(language, 'Para Empresas', 'For Businesses')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {getLocalizedText(
                language,
                'Modernize o networking profissional da sua equipa com as soluções empresariais PocketCV.',
                'Modernize your team\'s professional networking with PocketCV business solutions.'
              )}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">{benefit.title}</h3>
                <p className="text-muted-foreground text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white transform hover:scale-105 transition-all duration-300 shadow-lg px-8" 
              asChild
            >
              <Link to="/pricing">
                {getLocalizedText(language, 'Pedido em Volume para a sua Empresa', 'Bulk Order for Your Business')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
