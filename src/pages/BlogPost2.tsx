
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";

const BlogPost2 = () => {
  const { language } = useLanguage();

  const title = isPortuguese(language) ? 'Dicas para um Perfil Profissional Perfeito' : 'Tips for a Perfect Professional Profile';
  const description = isPortuguese(language) 
    ? 'Guia completo sobre como criar um perfil profissional que impressiona e gera resultados. Descubra as melhores práticas para destacar-se no mercado de trabalho.'
    : 'Complete guide on how to create a professional profile that impresses and generates results. Discover the best practices to stand out in the job market.';

  const content = isPortuguese(language) ? {
    intro: 'Um perfil profissional bem estruturado é a chave para abrir portas no mercado de trabalho. Com a digitalização crescente, ter um perfil online atrativo e completo tornou-se essencial para qualquer profissional.',
    section1Title: 'Elementos Essenciais de um Perfil Profissional',
    section1: 'Todo perfil profissional deve incluir: foto profissional de qualidade, resumo executivo claro, experiência detalhada, competências relevantes e informações de contacto atualizadas. Estes elementos formam a base de uma apresentação profissional sólida.',
    section2Title: 'A Importância da Primeira Impressão Digital',
    section2: 'A primeira impressão é formada em segundos. Uma foto profissional, um título atrativo e um resumo bem escrito podem fazer a diferença entre ser contactado ou ignorado por recrutadores e potenciais clientes.',
    section3Title: 'Optimização para Resultados',
    section3: 'Use palavras-chave relevantes da sua área, mantenha as informações sempre atualizadas e inclua links para o seu trabalho. Plataformas como o PocketCV permitem criar perfis dinâmicos que se adaptam às suas necessidades profissionais.',
    conclusion: 'Investir tempo na criação de um perfil profissional completo é investir no seu futuro. Com as ferramentas certas, pode criar uma presença digital que trabalha a seu favor 24/7.'
  } : {
    intro: 'A well-structured professional profile is the key to opening doors in the job market. With increasing digitalization, having an attractive and complete online profile has become essential for any professional.',
    section1Title: 'Essential Elements of a Professional Profile',
    section1: 'Every professional profile should include: quality professional photo, clear executive summary, detailed experience, relevant skills and updated contact information. These elements form the foundation of a solid professional presentation.',
    section2Title: 'The Importance of Digital First Impression',
    section2: 'First impressions are formed in seconds. A professional photo, an attractive title and a well-written summary can make the difference between being contacted or ignored by recruiters and potential clients.',
    section3Title: 'Optimization for Results',
    section3: 'Use relevant keywords from your field, keep information always updated and include links to your work. Platforms like PocketCV allow you to create dynamic profiles that adapt to your professional needs.',
    conclusion: 'Investing time in creating a complete professional profile is investing in your future. With the right tools, you can create a digital presence that works in your favor 24/7.'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{title} - PocketCV Blog</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={isPortuguese(language) 
          ? 'perfil profissional, curriculum vitae, CV digital, PocketCV, carreira profissional, desenvolvimento profissional, perfil online, networking profissional'
          : 'professional profile, curriculum vitae, digital CV, PocketCV, professional career, professional development, online profile, professional networking'
        } />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/lovable-uploads/3f16e4ea-ca63-43ad-b0fa-b5c4e29ac6bb.png" />
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
                  src="/lovable-uploads/3f16e4ea-ca63-43ad-b0fa-b5c4e29ac6bb.png" 
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
                  <span>10 {isPortuguese(language) ? 'Dezembro' : 'December'} 2024</span>
                </div>
                <span>•</span>
                <span>{isPortuguese(language) ? '7 min leitura' : '7 min read'}</span>
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
                {isPortuguese(language) ? 'Crie o seu perfil profissional hoje' : 'Create your professional profile today'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isPortuguese(language) 
                  ? 'Use o PocketCV para criar um perfil profissional que se destaca e gera resultados.'
                  : 'Use PocketCV to create a professional profile that stands out and generates results.'
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

export default BlogPost2;
