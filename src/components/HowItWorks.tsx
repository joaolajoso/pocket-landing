
import { useEffect, useRef } from "react";
import { Smartphone, Share2, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Add translations for How It Works section
const translations = {
  en: {
    title: "How <span class='text-gradient'>PocketCV</span> Works",
    subtitle: "Connect with professionals instantly using NFC technology. No more fumbling for business cards or typing URLs.",
    steps: [
      {
        title: "Get Your PocketCV Card",
        description: "Order your NFC-enabled PocketCV card with a sleek design that reflects your professional identity."
      },
      {
        title: "Create Your Digital Profile",
        description: "Set up your personal landing page with your professional details, links, CV, and contact information."
      },
      {
        title: "Tap to Share",
        description: "When networking, simply ask others to tap your card with their smartphone. Their device instantly loads your profile."
      }
    ],
    altText: "PocketCV NFC Technology"
  },
  pt: {
    title: "Como o <span class='text-gradient'>PocketCV</span> Funciona",
    subtitle: "Conecte-se com profissionais instantaneamente usando tecnologia NFC. Sem mais problemas com cartões de visita ou digitação de URLs.",
    steps: [
      {
        title: "Obtenha Seu Cartão PocketCV",
        description: "Peça seu cartão PocketCV habilitado para NFC com um design elegante que reflete sua identidade profissional."
      },
      {
        title: "Crie Seu Perfil Digital",
        description: "Configure sua página pessoal com seus detalhes profissionais, links, currículo e informações de contato."
      },
      {
        title: "Toque para Compartilhar",
        description: "Ao fazer networking, basta pedir que outros toquem seu cartão com o smartphone. O dispositivo carrega instantaneamente seu perfil."
      }
    ],
    altText: "Tecnologia NFC do PocketCV"
  }
};

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700"
            dangerouslySetInnerHTML={{ __html: t.title }}
          ></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* NFC Illustration */}
          <div className="order-2 md:order-1 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <div className="relative mx-auto max-w-md">
              <img 
                src="/lovable-uploads/0e836221-66c4-4448-867a-db5f39148b65.png" 
                alt={t.altText} 
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="order-1 md:order-2 space-y-10">
            <div className="flex gap-5 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-full pocketcv-gradient-bg flex items-center justify-center text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t.steps[0].title}</h3>
                <p className="text-muted-foreground">
                  {t.steps[0].description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-5 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-400">
              <div className="flex-shrink-0 w-12 h-12 rounded-full pocketcv-gradient-bg flex items-center justify-center text-white">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t.steps[1].title}</h3>
                <p className="text-muted-foreground">
                  {t.steps[1].description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-5 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-500">
              <div className="flex-shrink-0 w-12 h-12 rounded-full pocketcv-gradient-bg flex items-center justify-center text-white">
                <Share2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t.steps[2].title}</h3>
                <p className="text-muted-foreground">
                  {t.steps[2].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
