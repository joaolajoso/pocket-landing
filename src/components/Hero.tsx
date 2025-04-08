
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100");
          entry.target.classList.remove("opacity-0", "translate-y-8");
        }
      });
    }, {
      threshold: 0.1
    });
    
    const elements = heroRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Translations for the Hero section
  const translations = {
    en: {
      title: "Your Digital Identity,",
      titleSpan: "Simplified",
      description: "Create your professional landing page in minutes. Share your links, CV, and contact information with a single tap through NFC.",
      getStarted: "Order Now",
      learnMore: "Learn More"
    },
    pt: {
      title: "Sua Identidade Digital,",
      titleSpan: "Simplificada",
      description: "Crie sua página profissional em minutos. Compartilhe seus links, currículo e informações de contato com um único toque via NFC.",
      getStarted: "Peça Agora",
      learnMore: "Saiba Mais"
    }
  };
  
  const t = translations[language as keyof typeof translations];

  return (
    <div ref={heroRef} className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-pocketcv-purple/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-pocketcv-orange/10 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
          <div className="max-w-2xl text-left lg:text-left space-y-8 lg:flex-1">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight md:leading-tight tracking-tight animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              {t.title} <br />
              <span className="text-[#9370db]">{t.titleSpan}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
              {t.description}
            </p>
            
            <div className="flex flex-row gap-4 justify-start lg:justify-start animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
              <Button size="lg" className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white rounded-md px-8 py-3" asChild>
                <Link to="/get-started">
                  {t.getStarted}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-md px-8 py-3" asChild>
                <a href="#how-it-works">
                  {t.learnMore}
                </a>
              </Button>
            </div>
          </div>

          {/* Card Image */}
          <div className="lg:flex-1 w-full max-w-md mx-auto lg:mx-0 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300">
            <div className="relative perspective-1000">
              <div className="animate-float">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src="/lovable-uploads/a9adab42-1a55-4b37-814c-8f7cc8a9d89a.png" 
                    alt="PocketCV Card" 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                </AspectRatio>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
