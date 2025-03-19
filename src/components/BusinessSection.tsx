
import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Building, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const BusinessSection = () => {
  const { language } = useLanguage();
  
  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-pocketcv-purple" />,
      title: language === 'en' ? 'Team Networking' : 'Networking em Equipe',
      description: language === 'en' 
        ? 'Equip your entire team with PocketCV cards for efficient and modern networking.'
        : 'Equipe toda a sua equipe com cartões PocketCV para networking eficiente e moderno.'
    },
    {
      icon: <Building className="h-8 w-8 text-pocketcv-purple" />,
      title: language === 'en' ? 'Bulk Savings' : 'Economia em Volume',
      description: language === 'en' 
        ? 'Reduced cost of €4 per card for orders of 50+ cards.'
        : 'Custo reduzido de €4 por cartão para pedidos de 50+ cartões.'
    },
    {
      icon: <Briefcase className="h-8 w-8 text-pocketcv-purple" />,
      title: language === 'en' ? 'Instant Updates' : 'Atualizações Instantâneas',
      description: language === 'en' 
        ? 'Update all team profiles instantly without reprinting outdated business cards.'
        : 'Atualize todos os perfis da equipe instantaneamente sem reimprimir cartões desatualizados.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gradient">
              {language === 'en' ? 'For Businesses' : 'Para Empresas'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Modernize your team\'s professional networking with PocketCV business solutions.'
                : 'Modernize o networking profissional da sua equipe com as soluções empresariais PocketCV.'}
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
              <Link to="/get-started">
                {language === 'en' ? 'Bulk Order for Your Business' : 'Pedido em Volume para sua Empresa'}
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
