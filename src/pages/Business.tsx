
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TrustedBySection from "@/components/TrustedBySection";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Users, 
  TrendingUp, 
  Palette, 
  DollarSign, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Building2,
  MapPin,
  Calendar
} from "lucide-react";

const Business = () => {
  const { language } = useLanguage();
  const { setTheme } = useTheme();

  useEffect(() => {
    // Force light mode for business page
    setTheme('light');
  }, [setTheme]);

  const benefits = [
    {
      icon: <Users className="h-12 w-12 text-pocketcv-orange" />,
      title: isPortuguese(language) ? 'Capture Mais Leads — Instantaneamente' : 'Capture More Leads — Instantly',
      description: isPortuguese(language) 
        ? 'Pare de perder clientes potenciais após eventos ou reuniões presenciais. Com cartões de visita NFC e nosso software inteligente de captura de leads, sua equipe pode coletar detalhes de contato, notas e contexto — tudo com um toque.'
        : 'Stop losing potential clients after events or in-person meetings. With NFC business cards and our smart lead capture software, your team can collect contact details, notes, and context — all with a single tap.',
      keywords: 'NFC business cards, lead capture tool, collect leads in-person'
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-pocketcv-orange" />,
      title: isPortuguese(language) ? 'Aumente as Vendas com Follow-ups Inteligentes' : 'Boost Sales with Smarter Follow-Ups',
      description: isPortuguese(language)
        ? 'Chega de conversas esquecidas ou cartões de visita perdidos. A PocketCV ajuda-o a fazer follow-up com cada contacto no momento certo, aumentando as suas taxas de conversão de networking e vendas de campo.'
        : 'No more forgotten chats or lost business cards. PocketCV helps you follow up with every contact at the right time, increasing your conversion rates from networking and field sales.',
      keywords: 'follow-up automation, increase sales, convert networking into sales'
    },
    {
      icon: <Palette className="h-12 w-12 text-pocketcv-orange" />,
      title: isPortuguese(language) ? 'Branding Profissional em Cada Ponto de Contacto' : 'Professional Branding at Every Touchpoint',
      description: isPortuguese(language)
        ? 'Personalize cada cartão digital para refletir a sua marca. A sua equipa deixa uma impressão memorável — e a visibilidade da sua marca cresce organicamente através de cada contacto partilhado.'
        : 'Customize every digital card to reflect your brand. Your team leaves a memorable impression — and your brand visibility grows organically through every contact shared.',
      keywords: 'branded digital business cards, company branding, team networking tool'
    },
    {
      icon: <DollarSign className="h-12 w-12 text-pocketcv-orange" />,
      title: isPortuguese(language) ? 'Poupe Tempo, Dinheiro e Papel' : 'Save Time, Money & Paper',
      description: isPortuguese(language)
        ? 'Abandone os custos de impressão e cartões de papel desatualizados. A solução de cartão de visita digital da PocketCV é ecológica, acessível e construída para escalar.'
        : 'Ditch the printing costs and outdated paper cards. PocketCV\'s digital business card solution is eco-friendly, affordable, and built for scale.',
      keywords: 'digital business cards, reduce printing costs, eco-friendly networking'
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-pocketcv-orange" />,
      title: isPortuguese(language) ? 'Acompanhe o Desempenho da Equipa no Campo' : 'Track Team Performance in the Field',
      description: isPortuguese(language)
        ? 'Obtenha visibilidade sobre como a sua equipa está a fazer networking. Acompanhe quem está a recolher contactos, a fazer follow-up e a transformar conversas do mundo real em resultados de negócios mensuráveis.'
        : 'Get visibility on how your team is networking. Track who\'s collecting contacts, following up, and turning real-world conversations into measurable business outcomes.',
      keywords: 'team networking analytics, field sales tool, performance tracking'
    }
  ];

  const companies = [
    {
      name: "Century21 Confiança",
      image: "/lovable-uploads/d43a5748-6bd1-4d38-8559-f2988dd53ee3.png",
      type: "Real Estate"
    },
    {
      name: "Bella Casa",
      image: "/lovable-uploads/0f42d62d-9544-4dc1-8a77-bd397561ad41.png",
      type: "Real Estate"
    },
    {
      name: "IAD",
      image: "/lovable-uploads/1a6bda67-f22e-42f4-a5d7-b4029e13d63d.png",
      type: "Real Estate"
    },
    {
      name: "iTRecruiter",
      image: "/lovable-uploads/cf16cd74-2405-4f13-a048-132f85b72e92.png",
      type: "Recruitment"
    }
  ];

  const useCases = [
    {
      icon: <Building2 className="h-8 w-8 text-pocketcv-purple" />,
      title: isPortuguese(language) ? 'Consultores Imobiliários' : 'Real Estate Consultants',
      description: isPortuguese(language) 
        ? 'Capture leads instantaneamente em open houses e eventos imobiliários.'
        : 'Capture leads instantly at open houses and real estate events.'
    },
    {
      icon: <MapPin className="h-8 w-8 text-pocketcv-purple" />,
      title: isPortuguese(language) ? 'Equipas de Vendas de Campo' : 'Field Sales Teams',
      description: isPortuguese(language)
        ? 'Converta encontros casuais em oportunidades de vendas rastreáveis.'
        : 'Convert casual encounters into trackable sales opportunities.'
    },
    {
      icon: <Calendar className="h-8 w-8 text-pocketcv-purple" />,
      title: isPortuguese(language) ? 'Organizadores de Eventos' : 'Event Organizers',
      description: isPortuguese(language)
        ? 'Facilite networking sem esforço para todos os participantes.'
        : 'Enable effortless networking for all attendees.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Para Empresas - PocketCV' : 'For Business - PocketCV'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Descubra como a PocketCV pode transformar o networking da sua empresa. Ferramenta de captura de leads para equipas de vendas e marketing.'
            : 'Discover how PocketCV can transform your company\'s networking. Lead capture tool for sales and marketing teams.'
          } 
        />
        <meta 
          name="keywords" 
          content="NFC business cards, lead capture tool, team networking, sales automation, digital business cards, field sales, marketing teams"
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/10 via-white to-[#ff5757]/10">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Por que as Empresas Usam PocketCV' : 'Why Businesses Use PocketCV'}
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              {isPortuguese(language) 
                ? 'A PocketCV é a ferramenta definitiva de captura de leads e networking para empresas que dependem de interações face a face — desde agências imobiliárias até equipas de eventos e prestadores de serviços.'
                : 'PocketCV is the ultimate lead capture and networking tool for businesses that rely on face-to-face interactions — from real estate agencies to event teams and service providers.'
              }
            </p>
            <Button size="lg" className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white" asChild>
              <Link to="/login">
                {isPortuguese(language) ? 'Começar Agora' : 'Get Started Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <TrustedBySection />

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {isPortuguese(language) ? 'Benefícios Principais' : 'Key Benefits'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isPortuguese(language) 
                  ? 'Descubra por que equipas com visão de futuro estão a integrar a PocketCV no seu fluxo de trabalho diário'
                  : 'Here\'s why forward-thinking teams are making PocketCV part of their daily workflow'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                  <div className="text-xs text-gray-400 italic">
                    Keywords: {benefit.keywords}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {isPortuguese(language) ? 'Casos de Uso' : 'Use Cases'}
              </h2>
              <p className="text-xl text-gray-600">
                {isPortuguese(language) 
                  ? 'Perfeito para profissionais que dependem de networking presencial'
                  : 'Perfect for professionals who rely on in-person networking'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center"
                >
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#8c52ff] to-[#ff5757]">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {isPortuguese(language) ? 'Pronto para Transformar o Networking da Sua Empresa?' : 'Ready to Transform Your In-Person Networking?'}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Junte-se às empresas que já estão convertendo mais leads e fechando mais negócios com PocketCV.'
                : 'Join the companies already converting more leads and closing more deals with PocketCV.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#8c52ff] hover:bg-gray-100" asChild>
                <Link to="/login">
                  {isPortuguese(language) ? 'Começar Agora' : 'Get Started with PocketCV'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8c52ff]" asChild>
                <Link to="/contact">
                  {isPortuguese(language) ? 'Falar com Vendas' : 'Talk to Sales'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Business;
