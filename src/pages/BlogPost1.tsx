
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BlogPost1 = () => {
  const { language } = useLanguage();
  const { toast } = useToast();

  const title = isPortuguese(language) ? 'O Futuro do Networking Profissional' : 'The Future of Professional Networking';
  const description = isPortuguese(language) 
    ? 'Como a tecnologia NFC está a revolucionar a forma como os profissionais se conectam e partilham informações, criando novas oportunidades de networking digital.'
    : 'How NFC technology is revolutionizing the way professionals connect and share information, creating new opportunities for digital networking.';

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: title,
      text: description,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: isPortuguese(language) ? 'Partilhado com sucesso!' : 'Shared successfully!',
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: isPortuguese(language) ? 'Link copiado!' : 'Link copied!',
          description: isPortuguese(language) ? 'O link foi copiado para a área de transferência' : 'The link has been copied to your clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: isPortuguese(language) ? 'Erro ao partilhar' : 'Error sharing',
        description: isPortuguese(language) ? 'Não foi possível partilhar o artigo' : 'Could not share the article',
        variant: "destructive"
      });
    }
  };

  const content = isPortuguese(language) ? {
    mainTitle: 'Esqueça os Cartões de Visita Frágeis: O Futuro do Networking Está no Seu Bolso (e é Mais Inteligente do Que Nunca)',
    intro: 'Cansado de colecionar uma montanha de cartões de visita de papel que inevitavelmente acabam numa gaveta esquecida? Não está sozinho. A forma como nos conectamos profissionalmente está a passar por uma transformação massiva, e é altura de embarcar antes de ficar para trás.',
    section1: 'Durante o que parece uma eternidade, o networking tem sido um jogo de trocar pequenos rectângulos de cartolina e esperar pelo melhor. Mas no nosso mundo híper-conectado e digital, isso simplesmente já não é suficiente. Entre na era do networking inteligente, sem falhas e sustentável, alimentado por tecnologias que já estão na palma da sua mão.',
    section2Title: 'A Magia de um Simples Toque: NFC é o Seu Novo Superpoder de Networking',
    section2: 'Provavelmente já usou Near Field Communication (NFC) para pagar o seu café ou passar pelos portões do metro. Agora, esta pequena tecnologia poderosa está prestes a revolucionar a sua vida profissional. Imagine isto: encontra um potencial cliente ou colaborador numa conferência. Em vez do desajeitado remexer por um cartão de visita, simplesmente toca o seu telefone no dele. Instantaneamente, eles têm o seu perfil profissional completo e atualizado – estamos a falar do seu LinkedIn, portfólio, redes sociais e qualquer outros links relevantes, tudo num pacote digital organizado.',
    section3Title: 'Benefícios Revolucionários',
    section3: 'Isto não é apenas sobre ser cool e conhecedor de tecnologia (embora, sejamos honestos, seja). Os benefícios do networking alimentado por NFC são revolucionários: Sempre Fresco, Sempre Ativo - O seu perfil digital pode ser atualizado em tempo real. Mudou de título? Lançou um novo projeto? Não precisa de encomendar um novo lote de cartões de visita. Os seus contactos terão sempre as suas informações mais recentes e melhores. Eco-Friendly e Sustentável - Pense nos biliões de cartões de visita impressos cada ano, apenas para serem deitados fora. O networking digital reduz significativamente o nosso consumo de papel, sendo uma vitória para a sua imagem profissional e para o planeta. Conexões Mais Ricas e Significativas - Sejamos realistas, um cartão de visita tradicional é bastante unidimensional. Um perfil digital permite partilhar uma imagem muito mais abrangente e dinâmica de quem é e o que faz, fomentando conexões mais profundas e memoráveis.',
    section4Title: 'O Crescimento do Networker Híbrido: Misturando o Melhor de Ambos os Mundos',
    section4: 'O futuro do networking profissional não é sobre abandonar as conexões presenciais por uma existência puramente digital. É sobre criar uma abordagem híbrida poderosa que combina o calor e toque pessoal das interações cara-a-cara com a eficiência e profundidade das ferramentas digitais. Pense nisso como aumentar as suas conversas do mundo real com um aperto de mão digital que dura.',
    section5Title: 'Porque Isto Importa Para Si Agora',
    section5: 'Soluções estão a emergir na vanguarda desta transformação, oferecendo perfis profissionais dinâmicos e interativos que vão muito além de um CV online estático. Estas plataformas permitem-lhe curar a sua história profissional, mostrar as suas competências com media rico, e partilhá-la sem problemas com qualquer pessoa, em qualquer lugar.',
    conclusion: 'Num mercado de trabalho competitivo e numa paisagem empresarial em constante evolução, manter-se à frente da curva é crucial. Adotar estas novas tecnologias de networking não é apenas uma tendência; é uma mudança fundamental na forma como construímos e mantemos relacionamentos profissionais. Os profissionais que abraçam esta mudança serão aqueles que se destacam, causam uma impressão duradoura e constroem uma rede robusta e envolvida que pode impulsionar as suas carreiras. Então, da próxima vez que for a um evento de networking, deixe a pilha de cartões de papel para trás. O futuro do networking profissional está aqui, e é tão simples como um toque. Está pronto para se conectar?'
  } : {
    mainTitle: 'Forget Flimsy Business Cards: The Future of Networking is in Your Pocket (and it\'s Smarter Than Ever)',
    intro: 'Tired of collecting a mountain of paper business cards that inevitably end up in a forgotten drawer? You\'re not alone. The way we connect professionally is undergoing a massive glow-up, and it\'s time to get on board before you get left behind.',
    section1: 'For what feels like forever, networking has been a game of exchanging small rectangles of cardstock and hoping for the best. But in our hyper-connected, digital-first world, that just doesn\'t cut it anymore. Enter the era of smart, seamless, and sustainable networking, powered by technologies that are already in the palm of your hand.',
    section2Title: 'The Magic of a Simple Tap: NFC is Your New Networking Superpower',
    section2: 'You\'ve probably used Near Field Communication (NFC) to pay for your coffee or breeze through the subway gates. Now, this powerful little technology is set to revolutionize your professional life. Imagine this: you meet a potential client or collaborator at a conference. Instead of the awkward fumble for a business card, you simply tap your phone to theirs. Instantly, they have your complete, up-to-date professional profile – we\'re talking your LinkedIn, portfolio, social media, and any other relevant links, all in one neat digital package.',
    section3Title: 'Game-Changing Benefits',
    section3: 'This isn\'t just about being cool and tech-savvy (although, let\'s be honest, it is). The benefits of NFC-powered networking are a game-changer: Always Fresh, Always On - Your digital profile can be updated in real-time. Changed your job title? Launched a new project? No need to order a new batch of business cards. Your contacts will always have your latest and greatest information. Eco-Friendly and Sustainable - Think of the billions of business cards that are printed each year, only to be thrown away. Digital networking significantly reduces our paper consumption, making it a win for your professional image and the planet. Richer, More Meaningful Connections - Let\'s face it, a traditional business card is pretty one-dimensional. A digital profile allows you to share a much more comprehensive and dynamic picture of who you are and what you do, fostering deeper and more memorable connections.',
    section4Title: 'The Rise of the Hybrid Networker: Blending the Best of Both Worlds',
    section4: 'The future of professional networking isn\'t about ditching in-person connections for a purely digital existence. It\'s about creating a powerful hybrid approach that combines the warmth and personal touch of face-to-face interactions with the efficiency and depth of digital tools. Think of it as augmenting your real-world conversations with a digital handshake that lasts.',
    section5Title: 'Why This Matters to You Right Now',
    section5: 'Solutions are emerging that are at the forefront of this transformation, offering dynamic and interactive professional profiles that go far beyond a static online resume. These platforms allow you to curate your professional story, showcase your skills with rich media, and seamlessly share it with anyone, anywhere.',
    conclusion: 'In a competitive job market and a constantly evolving business landscape, staying ahead of the curve is crucial. Adopting these new networking technologies isn\'t just a trend; it\'s a fundamental shift in how we build and maintain professional relationships. The professionals who embrace this change will be the ones who stand out, make a lasting impression, and build a robust and engaged network that can propel their careers forward. So, the next time you head to a networking event, leave the stack of paper cards behind. The future of professional networking is here, and it\'s as simple as a tap. Are you ready to connect?'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{title} - PocketCV Blog</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={isPortuguese(language) 
          ? 'networking profissional, tecnologia NFC, cartão digital, PocketCV, conexões profissionais, networking digital, futuro do networking, cartão de visita digital'
          : 'professional networking, NFC technology, digital card, PocketCV, professional connections, digital networking, future of networking, digital business card'
        } />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/lovable-uploads/a4603f50-7863-4d79-b363-9196c281ee18.png" />
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
                  src="/lovable-uploads/a4603f50-7863-4d79-b363-9196c281ee18.png" 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
                {content.mainTitle}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>15 {isPortuguese(language) ? 'Maio' : 'May'} 2025</span>
                </div>
                <span>•</span>
                <span>{isPortuguese(language) ? '5 min leitura' : '5 min read'}</span>
              </div>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-[#8c52ff] hover:text-[#ff5757] transition-colors"
              >
                <Share2 className="h-4 w-4" />
                {isPortuguese(language) ? 'Partilhar' : 'Share'}
              </button>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8">{content.intro}</p>
              
              <p className="mb-6">{content.section1}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section2Title}</h2>
              <p className="mb-6">{content.section2}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section3Title}</h2>
              <p className="mb-6">{content.section3}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section4Title}</h2>
              <p className="mb-6">{content.section4}</p>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{content.section5Title}</h2>
              <p className="mb-6">{content.section5}</p>
              
              <div className="bg-gradient-to-r from-[#8c52ff]/10 to-[#ff5757]/10 p-6 rounded-lg mb-8">
                <p className="font-medium">{content.conclusion}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-bold mb-4">
                {isPortuguese(language) ? 'Pronto para modernizar o seu networking?' : 'Ready to modernize your networking?'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isPortuguese(language) 
                  ? 'Crie o seu perfil profissional digital com PocketCV e comece a fazer networking de forma mais eficiente.'
                  : 'Create your digital professional profile with PocketCV and start networking more efficiently.'
                }
              </p>
              <Link 
                to="/login?signup=true"
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

export default BlogPost1;
