
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";

const BlogPost3 = () => {
  const { language } = useLanguage();

  const title = isPortuguese(language) ? 'Como Partilhar o Seu Perfil Profissional' : 'How to Share Your Professional Profile';
  const description = isPortuguese(language) 
    ? 'Métodos eficazes para partilhar o seu perfil PocketCV e maximizar as suas conexões profissionais. Descubra como usar QR codes, NFC e outras tecnologias.'
    : 'Effective methods to share your PocketCV profile and maximize your professional connections. Discover how to use QR codes, NFC and other technologies.';

  const content = isPortuguese(language) ? {
    intro: 'Ter um perfil profissional excelente é apenas o primeiro passo. Saber como partilhá-lo de forma eficaz é crucial para maximizar as oportunidades de networking e desenvolvimento profissional.',
    section1Title: 'Métodos Tradicionais vs Digitais',
    section1: 'Enquanto os cartões de visita tradicionais ainda têm o seu lugar, os métodos digitais oferecem vantagens significativas: sempre atualizados, ecológicos, interativos e com muito mais informação. O QR code é uma ponte perfeita entre o físico e o digital.',
    section2Title: 'Tecnologia NFC: O Futuro da Partilha',
    section2: 'A tecnologia NFC permite partilhar o seu perfil com um simples toque no smartphone. É rápida, intuitiva e impressiona os contactos profissionais. Com o PocketCV, pode ter toda a sua informação profissional sempre à distância de um toque.',
    section3Title: 'Estratégias de Partilha Eficazes',
    section3: 'Use diferentes métodos conforme a situação: QR codes em apresentações, cartões NFC em eventos presenciais, links diretos em emails e assinaturas digitais. A diversificação garante que alcança todos os tipos de contactos profissionais.',
    conclusion: 'A combinação de métodos tradicionais e digitais cria uma estratégia de networking robusta. O importante é facilitar ao máximo o acesso ao seu perfil profissional.'
  } : {
    intro: 'Having an excellent professional profile is just the first step. Knowing how to share it effectively is crucial to maximize networking and professional development opportunities.',
    section1Title: 'Traditional vs Digital Methods',
    section1: 'While traditional business cards still have their place, digital methods offer significant advantages: always updated, ecological, interactive and with much more information. QR code is a perfect bridge between physical and digital.',
    section2Title: 'NFC Technology: The Future of Sharing',
    section2: 'NFC technology allows you to share your profile with a simple tap on the smartphone. It\'s fast, intuitive and impresses professional contacts. With PocketCV, you can have all your professional information always within reach of a tap.',
    section3Title: 'Effective Sharing Strategies',
    section3: 'Use different methods depending on the situation: QR codes in presentations, NFC cards at in-person events, direct links in emails and digital signatures. Diversification ensures you reach all types of professional contacts.',
    conclusion: 'The combination of traditional and digital methods creates a robust networking strategy. The important thing is to make access to your professional profile as easy as possible.'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{title} - PocketCV Blog</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={isPortuguese(language) 
          ? 'partilhar perfil profissional, QR code profissional, cartão NFC, PocketCV, networking digital, partilha de contactos, código QR, tecnologia NFC'
          : 'share professional profile, professional QR code, NFC card, PocketCV, digital networking, contact sharing, QR code, NFC technology'
        } />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/lovable-uploads/2a7f8ce8-8c35-49be-8e87-49f4e11ad191.png" />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        <article className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-[#8c52ff] hover:text-[#ff5757] transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              {isPortuguese(language) ? 'Voltar ao Blog' : 'Back to Blog'}
            </Link>

            <header className="mb-12">
              <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/2a7f8ce8-8c35-49be-8e87-49f4e11ad191.png" 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
                {title}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>5 {isPortuguese(language) ? 'Dezembro' : 'December'} 2024</span>
                </div>
                <span>•</span>
                <span>{isPortuguese(language) ? '6 min leitura' : '6 min read'}</span>
              </div>
              
              <button className="flex items-center gap-2 text-[#8c52ff] hover:text-[#ff5757] transition-colors">
                <Share2 className="h-4 w-4" />
                {isPortuguese(language) ? 'Partilhar' : 'Share'}
              </button>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8">{content.intro}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section1Title}</h2>
              <p className="mb-6">{content.section1}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section2Title}</h2>
              <p className="mb-6">{content.section2}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section3Title}</h2>
              <p className="mb-6">{content.section3}</p>
              
              <div className="bg-gradient-to-r from-[#8c52ff]/10 to-[#ff5757]/10 p-6 rounded-lg mb-8">
                <p className="font-medium">{content.conclusion}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-bold mb-4">
                {isPortuguese(language) ? 'Comece a partilhar o seu perfil hoje' : 'Start sharing your profile today'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isPortuguese(language) 
                  ? 'Crie o seu perfil PocketCV e comece a fazer networking de forma mais eficiente e moderna.'
                  : 'Create your PocketCV profile and start networking more efficiently and modernly.'
                }
              </p>
              <Link 
                to="/login"
                className="inline-block bg-gradient-to-r from-[#8c52ff] to-[#ff5757] text-white font-semibold py-3 px-6 rounded-lg hover:from-[#7c47ea] hover:to-[#ef4444] transition-colors"
              >
                {isPortuguese(language) ? 'Começar Agora' : 'Get Started Now'}
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost3;
