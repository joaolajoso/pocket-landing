import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Contact, Bell, LayoutDashboard, Plug, TrendingUp } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

const FeatureSection = () => {
  const { t, language } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play functionality
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [api]);

  const isPt = isPortuguese(language);
  
  const features = [
    {
      Icon: Contact,
      name: isPt ? "Captura Instantânea de Contactos" : "Instant Contact Capture",
      description: isPt 
        ? "Capture, armazene e organize conexões em segundos — sem mais cartões de visita ou entrada manual de dados."
        : "Snap, store, and organize connections in seconds — no more business cards or manual data entry.",
      href: "/login",
      cta: isPt ? "Saber mais" : "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600" />
      ),
      className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2 text-white",
    },
    {
      Icon: Bell,
      name: isPt ? "Follow-Ups Inteligentes" : "Smart Follow-Ups",
      description: isPt
        ? "Automatize follow-ups personalizados para manter cada lead ativo e as conversas a fluir."
        : "Automate personalized follow-ups to keep every lead warm and conversations flowing.",
      href: "/login",
      cta: isPt ? "Saber mais" : "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-orange-400" />
      ),
      className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-2 text-white",
    },
    {
      Icon: LayoutDashboard,
      name: isPt ? "Dashboard Organizado e Seguro" : "Organized & Secure Dashboard",
      description: isPt
        ? "Aceda a todos os seus leads e dados de eventos num hub claro e estruturado — sem dados perdidos, sem caos."
        : "Access all your leads and event data in one clear, structured hub — no lost data, no chaos.",
      href: "/login",
      cta: isPt ? "Saber mais" : "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-700 via-pink-600 to-rose-500" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4 text-white",
    },
    {
      Icon: Plug,
      name: isPt ? "Integração Sem Esforço" : "Effortless Integration",
      description: isPt
        ? "Sincronize facilmente com o seu CRM e ferramentas, mantendo os fluxos de trabalho suaves e ininterruptos."
        : "Sync seamlessly with your CRM and tools, keeping workflows smooth and uninterrupted.",
      href: "/login",
      cta: isPt ? "Saber mais" : "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-violet-700 to-indigo-600" />
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4 text-white",
    },
    {
      Icon: TrendingUp,
      name: isPt ? "Networking e Gestão Baseados em Dados" : "Data-Driven Networking and Management",
      description: isPt
        ? "Acompanhe o desempenho, analise a qualidade dos leads e aumente o ROI dos seus eventos com insights acionáveis."
        : "Track performance, analyze lead quality, and boost your event ROI with actionable insights.",
      href: "/login",
      cta: isPt ? "Saber mais" : "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-700 via-pink-600 to-orange-500" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4 text-white",
    },
  ];
  
  return (
    <section id="features" className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-orange-600 to-white" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">{t.features.title}</h2>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        {/* Desktop/Tablet: Bento Grid */}
        <div className="hidden md:block">
          <BentoGrid className="lg:grid-rows-3 max-w-6xl mx-auto">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden max-w-md mx-auto">
          <Carousel 
            setApi={setApi} 
            opts={{ 
              loop: true,
              align: "center"
            }}
          >
            <CarouselContent>
              {features.map((feature) => (
                <CarouselItem key={feature.name}>
                  <BentoCard {...feature} className="text-white h-[320px]" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          {/* Dot Indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/30"
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
