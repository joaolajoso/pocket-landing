import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { ThreeHeroBackground } from "@/components/ui/ThreeHeroBackground";
import heroImage from "@/assets/hero-networking-final.webp";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

const Hero = ({ className }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = heroRef.current?.querySelectorAll(".animate-on-scroll");
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      elements?.forEach((el) => {
        el.classList.add("opacity-100");
        el.classList.remove("opacity-0", "translate-y-8");
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("opacity-100");
            target.classList.remove("opacity-0", "translate-y-8");
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements?.forEach((el) => observer.observe(el));
    return () => {
      elements?.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const translations = {
    en: {
      title: "Join the",
      titleEmphasis: "networking revolution.",
      description: "PocketCV turns in-person networking into measurable outcomes — for professionals, teams, exhibitors, and the organizers behind the events they attend.",
      getStarted: "Start free — no card needed",
      learnMore: "See how it works",
      socialProof: [
        { label: "SIM Conference 2025", suffix: "partner" },
        { label: "FutureEXPO", suffix: "partner" },
        { label: "2nd place", suffix: "Poliempreende, Univ. Aveiro" },
        { label: "Coimbra Invest Summit", suffix: "2025" },
      ]
    },
    pt: {
      title: "Junte-se à",
      titleEmphasis: "revolução do networking.",
      description: "A PocketCV transforma o networking presencial em resultados mensuráveis — para profissionais, equipas, expositores e os organizadores por trás dos eventos.",
      getStarted: "Comece grátis — sem cartão",
      learnMore: "Veja como funciona",
      socialProof: [
        { label: "SIM Conference 2025", suffix: "parceiro" },
        { label: "FutureEXPO", suffix: "parceiro" },
        { label: "2º lugar", suffix: "Poliempreende, Univ. Aveiro" },
        { label: "Coimbra Invest Summit", suffix: "2025" },
      ]
    },
    es: {
      title: "Únete a la",
      titleEmphasis: "revolución del networking.",
      description: "PocketCV convierte el networking presencial en resultados medibles — para profesionales, equipos, expositores y los organizadores detrás de los eventos.",
      getStarted: "Empieza gratis — sin tarjeta",
      learnMore: "Descubre cómo funciona",
      socialProof: [
        { label: "SIM Conference 2025", suffix: "partner" },
        { label: "FutureEXPO", suffix: "partner" },
        { label: "2º puesto", suffix: "Poliempreende, Univ. Aveiro" },
        { label: "Coimbra Invest Summit", suffix: "2025" },
      ]
    },
    fr: {
      title: "Rejoignez la",
      titleEmphasis: "révolution du networking.",
      description: "PocketCV transforme le networking en personne en résultats mesurables — pour les professionnels, équipes, exposants et les organisateurs d'événements.",
      getStarted: "Commencez gratuitement",
      learnMore: "Découvrez comment",
      socialProof: [
        { label: "SIM Conference 2025", suffix: "partenaire" },
        { label: "FutureEXPO", suffix: "partenaire" },
        { label: "2e place", suffix: "Poliempreende, Univ. Aveiro" },
        { label: "Coimbra Invest Summit", suffix: "2025" },
      ]
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div ref={heroRef} className={cn("relative pt-20 md:pt-24 overflow-hidden", className)}>
      {/* Three.js background - lazy loaded for performance */}
      <div className="absolute inset-0 -z-10">
        <ThreeHeroBackground />
      </div>

      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-end">
          <div className="max-w-2xl text-left lg:text-left space-y-6 lg:flex-1 pb-6 lg:pb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 mix-blend-difference text-white relative z-10">
              {t.title} <br />
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mix-blend-normal italic">
                {t.titleEmphasis}
              </span>
            </h1>

            <p className="text-lg md:text-xl mix-blend-difference text-white/90 relative z-10 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 max-w-2xl">
              {t.description}
            </p>

            <div className="flex flex-row gap-4 justify-start lg:justify-start animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 relative z-10">
              <Link
                to="/auth"
                className="group relative inline-flex items-center justify-center rounded-2xl px-8 py-3 text-base font-semibold text-white overflow-hidden shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 transition-opacity duration-300" />
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute inset-0 rounded-2xl ring-1 ring-white/20 group-hover:ring-white/30 transition-all" />
                <span className="relative z-10">{t.getStarted}</span>
              </Link>
              <a
                href="#how-it-works"
                className="group relative inline-flex items-center justify-center rounded-2xl px-8 py-3 text-base font-semibold text-foreground overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] bg-white/80 hover:bg-white/90 shadow-lg border border-white/40"
              >
                <span className="relative z-10">{t.learnMore}</span>
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-3 md:gap-5 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 relative z-10">
              {t.socialProof.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-foreground/30 hidden md:block" />}
                  <span className="text-xs md:text-sm text-foreground/70">
                    <strong className="text-foreground font-medium">{item.label}</strong>{" "}
                    {item.suffix}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:flex-1 w-full max-w-2xl mx-auto lg:mx-0 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 flex items-end">
            <img
              src={heroImage}
              alt="People networking and sharing contact information digitally"
              className="w-full h-auto object-contain object-bottom scale-[1.2]"
              width="1184"
              height="864"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
