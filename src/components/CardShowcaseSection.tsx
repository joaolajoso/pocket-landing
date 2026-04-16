import React, { useEffect, useRef } from "react";
import { InteractiveCard3D } from "@/components/shop/InteractiveCard3D";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Zap, RefreshCw, Leaf } from "lucide-react";
import nfcCardPocketCV from "@/assets/shop/nfc-card-pocketcv.png";

const CardShowcaseSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
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

  const features = [
    {
      icon: Zap,
      title: isPt ? "Conexão Instantânea" : "Instant Connection",
      description: isPt
        ? "Um toque e pronto. Compartilhe tudo sem apps ou configurações."
        : "One tap and you're done. Share everything without apps or setup.",
    },
    {
      icon: RefreshCw,
      title: isPt ? "Sempre Atualizado" : "Always Up-to-Date",
      description: isPt
        ? "Atualize o seu perfil online e todos que têm o seu cartão veem as mudanças."
        : "Update your profile online and everyone with your card sees the changes.",
    },
    {
      icon: Leaf,
      title: isPt ? "Zero Desperdício" : "Zero Waste",
      description: isPt
        ? "Um cartão de visita para sempre. Sem reimpressões e sem deitar nada fora."
        : "One card forever. No reprinting, no throwing away.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-background via-background to-muted/10"
    >
      {/* Background tech elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pocketcv-purple rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pocketcv-coral rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-pocketcv-purple bg-pocketcv-purple/10 px-4 py-2 rounded-full border border-pocketcv-purple/20">
              {isPt ? "O Futuro do Networking" : "The Future of Networking"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {isPt ? "Mais que um Cartão" : "More Than a Card"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isPt
              ? "Tecnologia NFC que transforma cada interação em uma oportunidade"
              : "NFC technology that turns every interaction into an opportunity"}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* 3D Card */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-150">
            <div className="relative">
              {/* Decorative border */}
              <div className="absolute -inset-4 bg-gradient-to-r from-pocketcv-purple/20 to-pocketcv-coral/20 rounded-2xl blur-xl opacity-50" />
              
              <div className="relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 lg:p-12">
                <InteractiveCard3D
                  imageSrc={nfcCardPocketCV}
                  alt="PocketCV NFC Card"
                  className="w-full h-auto rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 group"
                  style={{ transitionDelay: `${(index + 2) * 150}ms` }}
                >
                  <div className="relative">
                    {/* Decorative line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pocketcv-purple/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex gap-4 pl-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pocketcv-purple/10 to-pocketcv-coral/10 border border-pocketcv-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-pocketcv-purple" />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-pocketcv-purple transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardShowcaseSection;
